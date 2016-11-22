import {diff} from 'rus-diff';

Meteor.methods({
  loadLookupData: (templateLibraries) => {
    check(templateLibraries, [Schema.TemplateLibrary]);
    let lookupData = {};
    _.each(templateLibraries, (templateLibrary) => {
      _.chain(templateLibrary.templates)
      .filter((template) => template.templateType === Constants.templateTypes.lookupData)
      .each((template) => {
        const lookupKeySetting = TemplateLibrariesHelper.getTemplateSettingByTemplateAndKeyAndIndex(template, Constants.templateSettingKeys.lookupKey, 0);
        switch (lookupKeySetting.value) {
          case 'sheetMaterialData':
            if (!lookupData[lookupKeySetting.value]) {
              lookupData[lookupKeySetting.value] = SheetMaterials.find({'templateLibraryId': templateLibrary._id}).fetch();
            }
            break;
          case 'standard':
            if (!lookupData[lookupKeySetting.value]) {
              lookupData[lookupKeySetting.value] = Lookups.find({'templateLibraryId': templateLibrary._id}).fetch();
            }
            break;
        }
      })
    });
    return lookupData;
  },
  saveLookup: function (lookup, isInsert) {
    check(lookup, Schema.Lookup);
    check(isInsert, Boolean);

    if (!Meteor.call("userCanUpdateLookup", this.userId, lookup.templateLibraryId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    const templateLibrary = TemplateLibraries.findOne(lookup.templateLibraryId);
    if (isInsert) {
      const now = new Date();
      const existingLookupSelector = {
        templateLibraryId: lookup.templateLibraryId,
        lookupType: lookup.lookupType,
        lookupSubType: lookup.lookupSubType,
        supplierId: lookup.supplierId,
        key: lookup.key,
        effectiveDate: { $lt : now },
        $or: [{
          expirationDate: null
        }, {
          expirationDate: { $gt : now }
        }],
      };
      // name is not a key identifier for price but it is for the other lookup types
      if (lookup.lookupType !== Constants.lookupTypes.price) {
        existingLookupSelector.name = lookup.name;
      }
      const existingLookup = Lookups.findOne(existingLookupSelector);
      // if the lookup being inserted is replacing an existing active lookup then
      // update existing lookup's expiration date to be new lookup's effective date
      if (existingLookup) {
        Lookups.update({_id: existingLookup._id}, {
          $set: {
            expirationDate: lookup.effectiveDate
          }
        });
      }
      Lookups.insert(lookup);
    } else {
      const existingLookup = Lookups.findOne({_id:lookup._id});
      const lookupMods = diff(existingLookup, lookup);
      if (lookupMods) {
        Lookups.update({_id: lookup._id}, lookupMods);
      }
    }
  }
});
