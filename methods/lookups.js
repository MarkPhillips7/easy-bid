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
  }
});
