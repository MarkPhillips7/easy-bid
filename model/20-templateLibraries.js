/**
 * Created by Mark on 6/15/2015.
 */

TemplateTypeInfoList = [{
  templateType: Constants.templateTypes.company,
  displayInHierarchy: true,
  templateSettingInfoList: [],
  relevantTemplateTypes: [{
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }]
}, {
  templateType: Constants.templateTypes.customer,
  displayInHierarchy: true,
  templateSettingInfoList: [],
  relevantTemplateTypes: [{
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }, {
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}, {
  templateType: Constants.templateTypes.job,
  displayInHierarchy: true,
  templateSettingInfoList: [],
  relevantTemplateTypes: [{
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }, {
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}, {
  templateType: Constants.templateTypes.area,
  displayInHierarchy: true,
  templateSettingInfoList: [],
  relevantTemplateTypes: [{
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }, {
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}, {
  templateType: Constants.templateTypes.productSelection,
  displayInHierarchy: true,
  templateSettingInfoList: [],
  relevantTemplateTypes: [{
    name: 'Products',
    templateType: Constants.templateTypes.product
  }, {
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }, {
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}, {
  templateType: Constants.templateTypes.baseProduct,
  displayInHierarchy: true,
  templateSettingInfoList: [{
    //SelectionType should always be Select
    name: 'Selection Type',
    templateSettingKey: Constants.templateSettingKeys.selectionType,
    templateSettingValue: Constants.selectionTypes.select,
    minCount: 1, //Required
    maxCount: 1,
    canDelete: false,
    canEdit: false,
    viewShow: false,
    editShow: false
  }, {
    name: 'Display Order',
    templateSettingKey: Constants.templateSettingKeys.displayOrder,
    minCount: 0,
    maxCount: 1,
    valueType: 'Number',
    viewShow: true,
    editShow: true
  }, {
    name: 'Display Locations',
    templateSettingKey: Constants.templateSettingKeys.displayCategory,
    minCount: 0,
    maxCount: -1, //allow unlimited number
    options: [{
      value: 'PrimaryTableColumn',
      name: 'Main Grid Column'
    }, {
      value: 'Primary',
      name: 'Primary Tab'
    }], //Any other existing DisplayCategory values should make up remaining options
    viewShow: true,
    editShow: true
  }, {
    name: 'Variable',
    templateSettingKey: Constants.templateSettingKeys.variableName,
    templateSettingValue: 'product',
    minCount: 1, //Required
    maxCount: 1,
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: true
  }],
  relevantTemplateTypes: [{
    name: 'Products',
    templateType: Constants.templateTypes.product
  }, {
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }, {
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}, {
  templateType: Constants.templateTypes.product,
  displayInHierarchy: true,
  templateSettingInfoList: [{
    name: 'Label',
    templateSettingKey: Constants.templateSettingKeys.displayCaption,
    minCount: 0,
    maxCount: 1,
    canDelete: true,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Type',
    templateSettingKey: Constants.templateSettingKeys.selectionType,
    templateSettingValue: Constants.selectionTypes.selectOption,
    minCount: 1, //Required
    maxCount: 1,
    canDelete: false,
    canEdit: false,
    viewShow: false,
    editShow: false
  }, {
    name: 'Sub Template?',
    templateSettingKey: Constants.templateSettingKeys.isASubTemplate,
    templateSettingValue: 'True',
    minCount: 1, //Required
    maxCount: 1,
    canDelete: false,
    canEdit: false,
    viewShow: false,
    editShow: false
  }, {
    name: 'Belongs To',
    templateSettingKey: Constants.templateSettingKeys.belongsTo,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: false
  }, {
    name: 'Image Path',
    templateSettingKey: Constants.templateSettingKeys.imageSource,
    minCount: 0,
    maxCount: -1,
    valueType: 'Image',
    canDelete: true,
    canEdit: true,
    viewShow: true,
    editShow: true
  }],
  relevantTemplateTypes: [{
    name: 'Sub-Products',
    templateType: Constants.templateTypes.product
  }, {
    name: 'Inputs',
    templateType: Constants.templateTypes.input
  }, {
    name: 'Calculations',
    templateType: Constants.templateTypes.calculation
  }, {
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}, {
  templateType: Constants.templateTypes.input,
  displayInHierarchy: false,
  templateSettingInfoList: [{
    name: 'Label',
    templateSettingKey: Constants.templateSettingKeys.displayCaption,
    minCount: 0,
    maxCount: 1,
    canDelete: true,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Type',
    templateSettingKey: Constants.templateSettingKeys.selectionType,
    minCount: 1,
    maxCount: 1,
    options: [{
      value: Constants.selectionTypes.select,
      name: 'Picklist'
    }, {
      value: Constants.selectionTypes.entry,
      name: 'Standard Input'
    }],
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Variable',
    templateSettingKey: Constants.templateSettingKeys.variableName,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Numerator Units',
    templateSettingKey: Constants.templateSettingKeys.numeratorUnit,
    minCount: 0,
    maxCount: -1,
    options: UnitOfMeasure.unitOptions,
    canDelete: false,
    canEdit: true,
    viewShow: false,
    editShow: true
  }, {
    name: 'Denominator Units',
    templateSettingKey: Constants.templateSettingKeys.denominatorUnit,
    minCount: 0,
    maxCount: -1,
    options: UnitOfMeasure.unitOptions,
    canDelete: false,
    canEdit: true,
    viewShow: false,
    editShow: true
  }, {
    name: 'Units',
    templateSettingKey: Constants.templateSettingKeys.unitsText,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: true
  }, {
    name: 'Belongs To',
    templateSettingKey: Constants.templateSettingKeys.belongsTo,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: false
  }, {
    name: 'Display Order',
    templateSettingKey: Constants.templateSettingKeys.displayOrder,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Display Locations',
    templateSettingKey: Constants.templateSettingKeys.displayCategory,
    minCount: 0,
    maxCount: -1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Default Value',
    templateSettingKey: Constants.templateSettingKeys.defaultValue,
    minCount: 0,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }],
  relevantTemplateTypes: []
}, {
  templateType: Constants.templateTypes.override,
  displayInHierarchy: false,
  templateSettingInfoList: [{
    name: 'Variable',
    templateSettingKey: Constants.templateSettingKeys.variableToOverride,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Is Variable Override',
    templateSettingKey: Constants.templateSettingKeys.isVariableOverride,
    templateSettingValue: 'True',
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: false,
    viewShow: false,
    editShow: false
  }, {
    name: 'Belongs To',
    templateSettingKey: Constants.templateSettingKeys.belongsTo,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: false
  }, {
    name: 'Property Overriding',
    templateSettingKey: Constants.templateSettingKeys.propertyToOverride,
    minCount: 1,
    maxCount: 1,
    options: [{
      value: 'DefaultValue',
      name: 'Default Value'
    }, {
      value: 'ValueFormula',
      name: 'Formula'
    }],
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Override Value',
    templateSettingKey: Constants.templateSettingKeys.overrideValue,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }],
  relevantTemplateTypes: []
}, {
  templateType: Constants.templateTypes.calculation,
  displayInHierarchy: false,
  templateSettingInfoList: [{
    name: 'Variable',
    templateSettingKey: Constants.templateSettingKeys.variableName,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Numerator Units',
    templateSettingKey: Constants.templateSettingKeys.numeratorUnit,
    minCount: 0,
    maxCount: -1,
    options: UnitOfMeasure.unitOptions,
    canDelete: false,
    canEdit: true,
    viewShow: false,
    editShow: true
  }, {
    name: 'Denominator Units',
    templateSettingKey: Constants.templateSettingKeys.denominatorUnit,
    minCount: 0,
    maxCount: -1,
    options: UnitOfMeasure.unitOptions,
    canDelete: false,
    canEdit: true,
    viewShow: false,
    editShow: true
  }, {
    name: 'Units',
    templateSettingKey: Constants.templateSettingKeys.unitsText,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: true
  }, {
    name: 'Belongs To',
    templateSettingKey: Constants.templateSettingKeys.belongsTo,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: false
  }, {
    name: 'Formula',
    templateSettingKey: Constants.templateSettingKeys.valueFormula,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }],
  relevantTemplateTypes: []
}];

TemplateLibraries = new Mongo.Collection("templateLibraries");

Schema.TemplateSetting = new SimpleSchema({
  key: {
    type: String
  },
  value: {
    type: String,
    optional: true
  },
  order: {
    type: Number,
    optional: true
  }
});

//Since you cannot do something like this (hierarchical schema referencing itself)
//Schema.Item = new SimpleSchema({
//  childItems: {
//    type: [Schema.Item]
//  }
//})
//Instead just make various versions of almost identical schemas
var itemTemplateDefinition = {
  // Using an id since we want these to be able to be referenced even though they are not in their own collection
  id: {
    type: String
  },
  name: {
    type: String,
    regEx: /^[a-z0-9A-z .]{3,50}$/
  },
  description: {
    type: String,
    optional: true
  },
  templateType: {
    type: String
  },
  // childTemplates has to get defined in for loop below
  //childTemplates: {
  //  type: [Schema.ItemTemplate],
  //  optional: true
  //},
  templateSettings: {
    type: [Schema.TemplateSetting],
    optional: true
  }
};
//Decided against having a childTemplates in favor of a separate TemplateRelationship
//var itemTemplate;
//var levelsOfHierarchy = 10;
//for (var i = 0; i < levelsOfHierarchy; i++) {
//  itemTemplate = new SimpleSchema(itemTemplateDefinition);
//  itemTemplateDefinition.childTemplates  = {
//    type: [itemTemplate],
//    optional: true
//  };
//}
//Schema.ItemTemplate = itemTemplate;

Schema.ItemTemplate = new SimpleSchema(itemTemplateDefinition);

Schema.TemplateRelationship = new SimpleSchema({
  parentTemplateId: {
    type: String
  },
  childTemplateId: {
    type: String
  },
  dependency: {
    type: String,
    defaultValue: Constants.dependency.required
  },
  relationToItem: {
    type: String,
    defaultValue: Constants.relationToItem.child
  }
});


//  new SimpleSchema({
//// Using an id since we want these to be able to be referenced even though they are not in their own collection
//id: {
//  type: String
//},
//name: {
//  type: String,
//  regEx: /^[a-z0-9A-z .]{3,30}$/
//},
//description: {
//  type: String,
//  optional: true
//},
//templateType: {
//  type: String
//},
//childTemplates: {
//  type: [Schema.ItemTemplate],
//  optional: true
//},
//templateSettings: {
//  type: [Schema.TemplateSetting],
//  optional: true
//}//,
////templateLibraryId: {
//  type: Meteor.Collection.ObjectID,
//  optional: true
//},
//public virtual ICollection<TemplateRelationship> TemplateRelationshipsAsParent { get; set; }
//public virtual ICollection<TemplateRelationship> TemplateRelationshipsAsChild { get; set; }
//public virtual ICollection<TemplateSetting> TemplateSettings { get; set; }
//  createdBy: {
//    type: String,
//    denyUpdate: true,
//    optional: true
//  },
//  createdAt: {
//    type: Date,
//    autoValue: function() {
//      if (this.isInsert) {
//        return new Date;
//      } else if (this.isUpsert) {
//        return {$setOnInsert: new Date};
//      } else {
//        this.unset();
//      }
//    }
// }
//});

Schema.TemplateLibrary = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    regEx: /^[a-z0-9A-z .]{3,30}$/
  },
  description: {
    type: String,
    optional: true
  },
  baseLibraryId: {
    type: String,
    optional: true
  },
  //Once a template library is used for a bid it should become read-only. Need to create a clone after that to update.
  isReadOnly: {
    type: Boolean,
    defaultValue: false
  },
  //Anybody can use/clone
  isPublic: {
    type: Boolean,
    defaultValue: false
  },
  ownerCompanyId: {
    type: String,
    optional: true
  },
  createdBy: {
    type: String,
    //denyUpdate: true,
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  },
  imageUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  templates: {
    type: [Schema.ItemTemplate],
    optional: true
  },
  templateRelationships: {
    type: [Schema.TemplateRelationship],
    optional: true
  }
});

TemplateLibraries.attachSchema(Schema.TemplateLibrary);

TemplateLibraries.allow({
  insert: function (userId, templateLibrary) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageTemplates], Roles.GLOBAL_GROUP))
      return false;

    return true;
  },
  update: function (userId, templateLibrary, fields, modifier) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageTemplates], Roles.GLOBAL_GROUP))
    //&& !Roles.userIsInRole(userId, [Config.roles.manageUsers], templateLibrary.name))
      return false;

    return true;
  },
  remove: function (userId, templateLibrary) {
    return false;
  }
});

function isABaseTemplate(template) {
  check(template, Schema.ItemTemplate);
  return getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.isABaseTemplate);
}

function isASubTemplate(template) {
  //check(template, Schema.ItemTemplate);
  return getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.isASubTemplate);
}

function getDisplayCaption(template){
  return getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.displayCaption) || template.name;

}

function getTemplateSettingValueForTemplate(template, templateSettingKey) {
  if (template && templateSettingKey) {

    var templateSetting = _.find(template.templateSettings, function (templateSetting) {
      return (templateSetting.key === templateSettingKey);
    });
    if (templateSetting) {
      return templateSetting.value;
    }
  }

  return null;
}

//If there can be only one setting value for template, consider using getTemplateSettingValueForTemplate instead.
function getTemplateSettingValuesForTemplate(template, templateSettingKey) {
  var templateSettingValues = [];
  if (template && templateSettingKey) {
    var templateSettings = _.filter(template.templateSettings, function (templateSetting) {
      return (templateSetting.key === templateSettingKey);
    });
    if (templateSettings && templateSettings.length > 0) {
      templateSettings.forEach(function (templateSetting) {
        templateSettingValues.push(templateSetting.value);
      });
    }
  }

  return templateSettingValues;
};


function getUnitsText(template) {
    return UnitOfMeasure.getUnitOfMeasureText(
        getTemplateSettingValuesForTemplate(template, Constants.templateSettingKeys.numeratorUnit),
        getTemplateSettingValuesForTemplate(template, Constants.templateSettingKeys.denominatorUnit));
  }

ItemTemplatesHelper = {
  isABaseTemplate: isABaseTemplate,
  isASubTemplate: isASubTemplate,
  getDisplayCaption: getDisplayCaption,
  getTemplateSettingValueForTemplate: getTemplateSettingValueForTemplate,
  getTemplateSettingValuesForTemplate: getTemplateSettingValuesForTemplate,
  getUnitsText: getUnitsText
}

function getRootTemplate (templateLibrary) {
  check(templateLibrary, Schema.TemplateLibrary);
  var rootTemplate = null;

  templateLibrary.templates.forEach(function (template) {
    var parentTemplate = _.find(templateLibrary.templateRelationships, function (templateRelationship) {
      return templateRelationship.childTemplateId === template.id;
    });

    // Return the template with no parent
    if (!parentTemplate) {
      rootTemplate = template;
      return;
    }
  });

  return rootTemplate;
}

function cloneTemplateLibrary(templateLibrary) {
  check(templateLibrary, Schema.TemplateLibrary);

  var clone = JSON.parse(JSON.stringify(templateLibrary));

  if (clone._id) {
    delete clone["_id"];
  }

  var idMappings = [];

  //Give all id's new values and use the new values in the template relationship references
  clone.templates.forEach(function (template) {
    var idMapping = {oldId: template.id, newId: Random.id()};
    template.id = idMapping.newId;
    idMappings.push(idMapping);
  });

  clone.templateRelationships.forEach(function (templateRelationship) {
    templateRelationship.parentTemplateId = _.find(idMappings, function (idMapping) {
      return idMapping.oldId === templateRelationship.parentTemplateId;
    }).newId;

    templateRelationship.childTemplateId = _.find(idMappings, function (idMapping) {
      return idMapping.oldId === templateRelationship.childTemplateId;
    }).newId;
  });

  return clone;
}

function parentTemplate(templateLibrary, template, dependenciesToIgnore) {
  if (templateLibrary && template) {
    var templateRelationship = _.find(templateLibrary.templateRelationships, function (relationship) {
      return relationship.childTemplateId === template.id
          && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, relationship.dependency));
    });
    if (templateRelationship) {
      return _.find(templateLibrary.templates, function (templ) {
        return templ.id == templateRelationship.parentTemplateId;
      });
    }
  }

  return null;
}

function parentTemplates(templateLibrary, template, dependenciesToIgnore){
  var parentTemplates = [];

  if (templateLibrary && template) {
    var parentTemplateRelationships=_.filter(templateLibrary.templateRelationships, function (templateRelationship) {
      return templateRelationship.childTemplateId === template.id
          && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
    })

    parentTemplates = _.map(parentTemplateRelationships, function (templateRelationship) {
      return _.find(templateLibrary.templates, function (templ) {return templ.id == templateRelationship.parentTemplateId; })});
  }

  return parentTemplates;
}

function templateChildren(templateLibrary, template, dependenciesToIgnore){
  var templateChildren = [];

  if (templateLibrary && template) {
    var childTemplateRelationships = _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
       return templateRelationship.parentTemplateId === template.id
            && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
    });

    templateChildren = _.map(childTemplateRelationships, function (templateRelationship) {
      return _.find(templateLibrary.templates, function (templ) {return templ.id == templateRelationship.childTemplateId; })});
  }

  return templateChildren;
}

TemplateLibrariesHelper = {
  getRootTemplate: getRootTemplate,
  cloneTemplateLibrary: cloneTemplateLibrary,
  parentTemplate:parentTemplate,
  parentTemplates: parentTemplates,
  templateChildren:templateChildren
}