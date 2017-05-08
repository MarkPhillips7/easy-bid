import {diff} from 'rus-diff';

const diffOnlyIncludesInserts = (mods) => {
  // ToDo: implement this
  return false;
}

Meteor.methods({
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
  saveTemplateLibrary: function (templateLibrary, isInsert) {
    check(templateLibrary, Schema.TemplateLibrary);
    check(isInsert, Boolean);

    if (isInsert) {
      if (!Meteor.call("userCanInsertTemplateLibrary", this.userId)) {
        throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
      }
      TemplateLibraries.insert(templateLibrary);
    } else {
      // const existingTemplateLibrary = TemplateLibraries.findOne({_id:templateLibrary._id});
      // diff does not look deep enough into the hierarchy to be of any value here
      // const templateLibraryMods = diff(existingTemplateLibrary, templateLibrary);
      // if (templateLibraryMods) {
      //   console.log(`templateLibraryMods: ${JSON.stringify(templateLibraryMods)}`);
      //   const onlyInsertingTemplates = diffOnlyIncludesInserts(templateLibraryMods);
      //   if (!Meteor.call("userCanUpdateTemplateLibrary", this.userId, templateLibrary._id, onlyInsertingTemplates)) {
      //     throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
      //   }
        TemplateLibraries.update({_id: templateLibrary._id}, templateLibrary);
      // }
    }
  }
});
