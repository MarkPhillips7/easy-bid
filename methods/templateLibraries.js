//Meteor.methods({
//  cloneTemplateLibrary: function (templateLibrary) {
//    check(templateLibrary, Schema.TemplateLibrary);
//
//    var clone = JSON.parse(JSON.stringify(templateLibrary));
//
//    if (clone._id) {
//      delete clone["_id"];
//    }
//
//    var idMappings = [];
//
//    //Give all id's new values and use the new values in the template relationship references
//    clone.templates.forEach(function(template) {
//      var idMapping={oldId:template.id, newId: Random.id()};
//      template.id = idMapping.newId;
//      idMappings.push(idMapping);
//    });
//
//    clone.templateRelationships.forEach(function(templateRelationship) {
//      var idMapping={oldId:template.id, newId: Random.id()};
//      template.parentTemplateId = _.find(idMappings, function(idMapping){
//        return idMapping.oldId === template.parentTemplateId;}).newId;
//      template.childTemplateId = _.find(idMappings, function(idMapping){
//        return idMapping.oldId === template.childTemplateId;}).newId;
//    });
//
//    return clone;
//  }
//});

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
