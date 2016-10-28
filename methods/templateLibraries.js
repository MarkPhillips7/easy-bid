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
