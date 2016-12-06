/**
 * Created by Mark on 6/15/2015.
 */

// import XLSX from 'xlsx';

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
  }, {
    name: 'Specification Groups',
    templateType: Constants.templateTypes.specificationGroup
  }, {
    name: 'Lookup Data',
    templateType: Constants.templateTypes.lookupData
  }
]
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
  templateType: Constants.templateTypes.lookupData,
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
    name: 'Variable',
    templateSettingKey: Constants.templateSettingKeys.variableName,
    minCount: 1, //Required
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
  }, {
    name: 'Lookup Key',
    templateSettingKey: Constants.templateSettingKeys.lookupKey,
    minCount: 0,
    maxCount: 1,
    viewShow: true,
    editShow: true
  }],
  relevantTemplateTypes: []
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
    name: 'Functions',
    templateType: Constants.templateTypes.function
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
    templateSettingValue: 'true',
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
    templateSettingValue: 'true',
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
    }, {
      value: 'Value',
      name: 'Value'
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
}, {
  templateType: Constants.templateTypes.function,
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
    name: 'Function',
    templateSettingKey: Constants.templateSettingKeys.function,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: true,
    editShow: true
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
}, {
  templateType: Constants.templateTypes.specificationGroup,
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
    //customOptions should always be "GetSpecificationOptions"
    name: 'Custom Options',
    templateSettingKey: Constants.templateSettingKeys.customOptions,
    minCount: 1, //Required
    maxCount: 1,
    canDelete: false,
    canEdit: false,
    viewShow: false,
    editShow: false
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
    minCount: 1,
    maxCount: 1,
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
  }, {
    name: 'Belongs To',
    templateSettingKey: Constants.templateSettingKeys.belongsTo,
    minCount: 0,
    maxCount: 0,//Because not a true template setting
    canDelete: false,
    canEdit: false,
    viewShow: true,
    editShow: false
  }],
  relevantTemplateTypes: [{
    name: 'Specifications',
    templateType: Constants.templateTypes.condition
  }]
}, {
  templateType: Constants.templateTypes.condition,
  displayInHierarchy: true,
  templateSettingInfoList: [{
    name: 'Condition Type',
    templateSettingKey: Constants.templateSettingKeys.conditionType,
    templateSettingValue: Constants.selectionTypes.select,
    minCount: 0,
    maxCount: 1,
    options: [{
      value: Constants.conditionTypes.switch,
      name: 'Case'
    }],
    viewShow: false,
    editShow: false
  }, {
    name: 'Switch Variable',
    templateSettingKey: Constants.templateSettingKeys.switchVariable,
    minCount: 1,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
    viewShow: false,
    editShow: false
  }, {
    name: 'Switch Value',
    templateSettingKey: Constants.templateSettingKeys.switchValue,
    minCount: 0,
    maxCount: 1,
    canDelete: false,
    canEdit: true,
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
  }],
  relevantTemplateTypes: [{
    name: 'Overrides',
    templateType: Constants.templateTypes.override
  }]
}];

TemplateLibraries = new Mongo.Collection("templateLibraries");

Schema.TemplateSetting = new SimpleSchema({
  // Using an id since we want these to be able to be referenced even though they are not in their own collection
  id: {
    type: String
  },
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
//Instead just make various versions of almost identical schemas. Actually not doing this either.

var itemTemplateDefinition = {
  // Using an id since we want these to be able to be referenced even though they are not in their own collection
  id: {
    type: String
  },
  name: {
    type: String,
    //regEx: /^[a-z0-9A-z .]{3,50}$/
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
  // Using an id since we want these to be able to be referenced even though they are not in their own collection
  id: {
    type: String
  },
  parentTemplateId: {
    type: String
  },
  childTemplateId: {
    type: String
  },
  dependency: {
    type: String,
    defaultValue: Constants.dependency.required,
    optional: true
  },
  relationToItem: {
    type: String,
    defaultValue: Constants.relationToItem.child,
    optional: true
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
  modifiedBy: {
    type: String,
    //denyUpdate: true,
    optional: true
  },
  modifiedAt: {
    type: Date,
    autoValue: function () {
      return new Date;
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
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageTemplates], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.manageTemplates], templateLibrary.ownerCompanyId))
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

function getDisplayCaption(template) {
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

function getJsonVariableName(template) {
  const templateVariableName = getTemplateSettingValueForTemplate(template, 'VariableName');
  return getJsonVariableNameByTemplateVariableName(templateVariableName);
}

function getJsonVariableNameByTemplateVariableName(templateVariableName) {
  // Prepend "var" to practically guarantee there won't be naming conflicts.
  if (templateVariableName) {
    return "var" + templateVariableName.toLowerCase();
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
  getJsonVariableName: getJsonVariableName,
  getJsonVariableNameByTemplateVariableName: getJsonVariableNameByTemplateVariableName,
  getTemplateSettingValueForTemplate: getTemplateSettingValueForTemplate,
  getTemplateSettingValuesForTemplate: getTemplateSettingValuesForTemplate,
  getUnitsText: getUnitsText
}

function getRootTemplate(templateLibrary) {
  //check(templateLibrary, Schema.TemplateLibrary);
  var rootTemplate = null;

  if (templateLibrary && templateLibrary.templates) {
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
  }

  return rootTemplate;
}

function cloneTemplateLibrary(templateLibrary) {
  //check(templateLibrary, Schema.TemplateLibrary);

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

const getTemplateLibraryWithTemplate = ({templateLibraries}, templateId) => {
  return _.find(templateLibraries, (templateLibrary) => _.some(templateLibrary.templates, (template) => template.id === templateId));
};

function getTemplateRelationshipById(templateLibrary, templateRelationshipId) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getTemplateRelationshipById';
  }
  return _.find(templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.id === templateRelationshipId;
  });
}

function getParentTemplateRelationships(bidControllerData, childTemplateId, dependenciesToIgnore) {
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, childTemplateId);
  if (!templateLibrary) {
    throw `templateLibrary not found for childTemplateId ${childTemplateId} in getParentTemplateRelationships`;
  }

  return _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.childTemplateId === childTemplateId
      && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
  });
}

// dependenciesToIgnore is optional
function getChildTemplateRelationships(bidControllerData, parentTemplateId, dependenciesToIgnore) {
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, parentTemplateId);
  if (!templateLibrary) {
    throw `templateLibrary not found for parentTemplateId ${parentTemplateId} in getChildTemplateRelationships`;
  }

  return _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.parentTemplateId === parentTemplateId
      && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
  });
}

function getTemplateParent(bidControllerData, template, dependenciesToIgnore) {
  if (template) {
    const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, template.id);
    if (templateLibrary) {
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
  }
  return null;
}

function getTemplateParents(bidControllerData, template, dependenciesToIgnore) {
  var parentTemplates = [];

  if (template) {
    const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, template.id);
    if (templateLibrary) {
      var parentTemplateRelationships = _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
        return templateRelationship.childTemplateId === template.id
          && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
      })

      parentTemplates = _.map(parentTemplateRelationships, function (templateRelationship) {
        return _.find(templateLibrary.templates, function (templ) {
          return templ.id === templateRelationship.parentTemplateId;
        })
      });
    }
  }
  return parentTemplates;
}

function getTemplateChildren(bidControllerData, template, dependenciesToIgnore) {
  var templateChildren = [];

  if (template) {
    const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, template.id);
    if (templateLibrary) {
      var childTemplateRelationships = _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
        return templateRelationship.parentTemplateId === template.id
          && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
      });

      templateChildren = _.map(childTemplateRelationships, function (templateRelationship) {
        return _.find(templateLibrary.templates, function (templ) {
          return templ.id == templateRelationship.childTemplateId;
        })
      });
    }
  }
  return templateChildren;
}

function addTemplate(templateLibrary, templateType, parentTemplate) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in addTemplate';
  }
  if (!templateType) {
    throw 'templateType must be set in addTemplate';
  }
  if (!parentTemplate) {
    throw 'parentTemplate must be set in addTemplate';
  }

  var templateToAdd = {
    id: Random.id(),
    templateType: templateType,
    templateSettings: []
  };
  templateLibrary.templates.push(templateToAdd);
  templateLibrary.templateRelationships.push({
    id: Random.id(),
    parentTemplateId: parentTemplate.id,
    childTemplateId: templateToAdd.id
  });

  return templateToAdd;
}

// Need to use this instead of counting on a template object being in the templates array.
// Even if a template was in the templates array, it might not be later even if it was not removed
// because I think angular meteor sometimes uses mongo style splices where a given object ends up
// getting updated to a different 1. Say you have [a,b,c] and you remove b. What angular/meteor/mongo
// does is alter the b object to be like c and actually remove c. And that gets reflected in meteor objects.
const getTemplateById = (bidControllerData, templateId) => {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getTemplateById';
  }

  const {templateLibraries} = bidControllerData;
  let template = null;
  _.find(templateLibraries, (templateLibrary) => {
    template = _.find(templateLibrary.templates, (template) => template.id === templateId);
    return template;
  });
  return template;
}

const getTemplateByType = (bidControllerData, templateType) => {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getTemplateByType';
  }

  const {templateLibraries} = bidControllerData;
  let template = null;
  _.find(templateLibraries, (templateLibrary) => {
    template = _.find(templateLibrary.templates, (template) => template.templateType === templateType);
    return template;
  });
  return template;
};

const getTemplatesByTemplateSetting = (bidControllerData, templateSettingKey, templateSettingValue) => {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getTemplatesByTemplateSetting';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in getTemplatesByTemplateSetting';
  }
  if (!templateSettingValue) {
    throw 'templateSettingValue must be set in getTemplatesByTemplateSetting';
  }

  const {templateLibraries} = bidControllerData;
  const templates = [];
  _.each(templateLibraries, (templateLibrary) => {
    _.each(templateLibrary.templates, (template) => {
      _.each(template.templateSettings, (templateSetting) => {
        if (templateSetting.key === templateSettingKey && templateSetting.value === templateSettingValue) {
          if (_.indexOf(templates, template) === -1 ) {
            templates.push(template);
          }
        }
      })
    })
  });
  return templates;
};

// Need to use this instead of counting on a template object being in the templates array.
// Even if a template was in the templates array, it might not be later even if it was not removed
// because I think angular meteor sometimes uses mongo style splices where a given object ends up
// getting updated to a different 1. Say you have [a,b,c] and you remove b. What angular/meteor/mongo
// does is alter the b object to be like c and actually remove c. And that gets reflected in meteor objects.
// function getTemplateById(templateLibrary, templateId) {
//   if (!templateLibrary) {
//     throw 'templateLibrary must be set in getTemplateById';
//   }
//   //if (!templateId) {
//   //  throw 'templateId must be set in getTemplateById';
//   //}
//   return _.find(templateLibrary.templates, function (template) {
//     return template.id === templateId;
//   });
// }
//
// function getTemplateByType(templateLibrary, templateType) {
//   if (!templateLibrary) {
//     throw 'templateLibrary must be set in getTemplateById';
//   }
//   //if (!templateId) {
//   //  throw 'templateId must be set in getTemplateById';
//   //}
//   return _.find(templateLibrary.templates, function (template) {
//     return template.templateType === templateType;
//   });
// }
//
// function getTemplatesByTemplateSetting(templateLibrary, templateSettingKey, templateSettingValue) {
//   if (!templateLibrary) {
//     throw 'templateLibrary must be set in getTemplatesByTemplateSetting';
//   }
//   if (!templateSettingKey) {
//     throw 'templateSettingKey must be set in getTemplatesByTemplateSetting';
//   }
//   if (!templateSettingValue) {
//     throw 'templateSettingValue must be set in getTemplatesByTemplateSetting';
//   }
//
//   const templates = [];
//   _.each(templateLibrary.templates, (template) => {
//     _.each(template.templateSettings, (templateSetting) => {
//       if (templateSetting.key === templateSettingKey && templateSetting.value === templateSettingValue) {
//         if (_.indexOf(templates, template) === -1 ) {
//           templates.push(template);
//         }
//       }
//     })
//   });
//   return templates;
// };

function getTemplateSettingByIds(bidControllerData, templateId, templateSettingId) {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getTemplateSettingByIds';
  }
  if (!templateId) {
    throw 'templateId must be set in getTemplateSettingByIds';
  }
  if (!templateSettingId) {
    throw 'templateSettingId must be set in getTemplateSettingByIds';
  }
  var template=getTemplateById(bidControllerData, templateId);
  if (template) {
    return _.find(template.templateSettings, function (templateSetting) {
      return templateSetting.id === templateSettingId;
    });
  }
  return undefined;
}

function getTemplateSettingByTemplateAndKeyAndIndex(template, templateSettingKey, templateSettingIndex) {
  if (!template) {
    throw 'template must be set in getTemplateSettingByTemplateAndKeyAndIndex';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in getTemplateSettingByTemplateAndKeyAndIndex';
  }

  if (template) {
    return _.filter(template.templateSettings, function (templateSetting) {
      return templateSetting.key === templateSettingKey;
    })[templateSettingIndex];
  }

  return undefined;
}

function getTemplateSettingByKeyAndIndex(bidControllerData, templateId, templateSettingKey, templateSettingIndex) {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getTemplateSettingByKeyAndIndex';
  }
  if (!templateId) {
    throw 'templateId must be set in getTemplateSettingByKeyAndIndex';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in getTemplateSettingByKeyAndIndex';
  }
  var template = getTemplateById(bidControllerData, templateId);

  return getTemplateSettingByTemplateAndKeyAndIndex(template, templateSettingKey, templateSettingIndex);
}

function addTemplateSetting(bidControllerData, templateId, templateSettingKey, templateSettingValue, order) {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in addTemplateSetting';
  }
  if (!templateId) {
    throw 'templateId must be set in addTemplateSetting';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in addTemplateSetting';
  }
  var template = getTemplateById(bidControllerData, templateId);
  if (!template) {
    throw `no template found for template ${templateId} in addTemplateSetting`;
  }
  var templateSetting= {
      id: Random.id(),
      key: templateSettingKey,
      value: templateSettingValue,
      order: order
    };

  template.templateSettings.push(templateSetting);

  return templateSetting;
}

function deleteTemplateSetting(bidControllerData, templateId, templateSettingId) {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getTemplateSettingByIds';
  }
  if (!templateId) {
    throw 'templateId must be set in getTemplateSettingByIds';
  }
  if (!templateSettingId) {
    throw 'templateSettingId must be set in getTemplateSettingByIds';
  }
  var template = getTemplateById(bidControllerData,templateId);
  if (!template) {
    throw 'no template found for templateId';//`no template found for template ${templateId} in templateLibrary ${templateLibrary._id}`;
  }
  var templateSetting=getTemplateSettingByIds(bidControllerData,templateId,templateSettingId);
  if (!templateSetting) {
    throw 'no templateSetting found for templateSettingId';//`no template found for template ${templateId} in templateLibrary ${templateLibrary._id}`;
  }

  template.templateSettings.splice(template.templateSettings.indexOf(templateSetting), 1);
}

function deleteTemplate(bidControllerData, templateId) {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in deleteTemplate';
  }
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, templateId);
  const template = getTemplateById(bidControllerData, templateId);
  if (!template) {
    throw `no template found for template ${templateId} in templateLibrary ${templateLibrary._id} in deleteTemplate`;
  }

  //First delete relationships
  var templateRelationships = _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.childTemplateId === template.id || templateRelationship.parentTemplateId === template.id;
  })

  templateRelationships.forEach(function (templateRelationship) {
    var templateRelationshipIndex=templateLibrary.templateRelationships.indexOf(templateRelationship);
    templateLibrary.templateRelationships.splice(templateRelationshipIndex, 1);
  });

  //Finally can now delete template
  var templateIndex=templateLibrary.templates.indexOf(template);
  templateLibrary.templates.splice(templateIndex, 1);
}

function getAllSubTemplatesOfBaseTemplateChild(bidControllerData, template) {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in getAllSubTemplatesOfBaseTemplateChild';
  }
  if (!template) {
    throw `template must be set in getAllSubTemplatesOfBaseTemplateChild`;
  }

  var subTemplateList = [];

  var baseTemplateChild = _.chain(TemplateLibrariesHelper.getTemplateChildren(bidControllerData, template))
    .find((childTemplate) => { return ItemTemplatesHelper.isABaseTemplate(childTemplate); })
    .value();

  populateSubTemplateListWithTemplateChildren(bidControllerData, baseTemplateChild, subTemplateList);

  return subTemplateList;
}

function populateSubTemplateListWithTemplateChildren(bidControllerData, template, subTemplateList) {
  _.each(TemplateLibrariesHelper.getTemplateChildren(bidControllerData, template),
    (childTemplate) => {
      if (ItemTemplatesHelper.isASubTemplate(childTemplate)) {
        subTemplateList.push(childTemplate);
        populateSubTemplateListWithTemplateChildren(bidControllerData, childTemplate, subTemplateList);
      }
    });
}

const getTemplateSettingsForTabs = (template) => {
  return _.filter(template.templateSettings, (templateSetting) => {
    return templateSetting.key === Constants.templateSettingKeys.displayCategory
        && templateSetting.value !== 'PrimaryTableColumn'
        && templateSetting.value !== 'PrimaryTableRow';
  });
};

// Of the children of the product selection return the template of the one whose templateType is Product
const  getProductTemplate = (bidControllerData, productSelectionId) => {
  const {selections, selectionRelationships, templateLibraries} = bidControllerData;
  const productSelection = _.find(selections, (_selection) => _selection._id === productSelectionId);
  const childSelectionIds = _.chain(selectionRelationships)
      .filter((relationship) => relationship.parentSelectionId === productSelectionId)
      .map((relationship) => relationship.childSelectionId)
      .value();
  let productTemplate = null;
  _.find(childSelectionIds, (childSelectionId) => {
    const childSelection = _.find(selections, (_selection) => _selection._id === childSelectionId);
    _.find(templateLibraries, (templateLibrary) => {
      const childSelectionTemplate = _.find(templateLibrary.templates,
        (template) => template.id === childSelection.templateId);
      if (childSelectionTemplate && childSelectionTemplate.templateType === Constants.templateTypes.product) {
        productTemplate = childSelectionTemplate;
        return true;
      }
      return false;
    })
    return productTemplate;
  });
  return productTemplate;
};

// return whether there is a direct relationship where candidateTemplate is a child of targetTemplate
// or (if templateTypeCandidates is specified) where candidateTemplate is a child of a parent of
// targetTemplate (or its parent, .etc.) that is of an appropriate template type.
// Essentially trying to determine if candidateTemplate belongs to a product or one of its base products.
const getAncestorRelationship = (bidControllerData, candidateTemplate, targetTemplate, templateTypeCandidates) => {
  if (!targetTemplate) {
    return null;
  }
  if (templateTypeCandidates && !_.some(templateTypeCandidates,
    (templateTypeCandidate) => templateTypeCandidate === targetTemplate.templateType)) {
    return null;
  }
  const candidateTemplateParents = getTemplateParents(bidControllerData, candidateTemplate, []);
  let qualifyingRelationship = _.find(candidateTemplateParents, (parentTemplate) => {
    if (!parentTemplate || !targetTemplate) {
      return null;
    }
    return parentTemplate.id === targetTemplate.id;
  });
  if (!qualifyingRelationship && templateTypeCandidates) {
    const targetTemplateParents = getTemplateParents(bidControllerData, targetTemplate, []);
    _.find(targetTemplateParents, (parentTemplate) => {
      qualifyingRelationship = getAncestorRelationship(bidControllerData, candidateTemplate, parentTemplate, templateTypeCandidates);
      return qualifyingRelationship;
    });
  }
  return qualifyingRelationship;
};

// A template is appropriate for tabs (the tabs when editing a product selection) based on the following rules:
// 1) One of these must be true:
//    candidateTemplate has a templateRelationship where it is the child of targetTemplate.
//    candidateTemplate has a templateRelationship where it is the child of productTemplate or a base template of productTemplate.
// 2) candidateTemplate cannot be a product (or base product)
// 3) If candidateTemplate has a userRole then the user must have that role (ToDo: implement)
// 4) There must be no template higher in the hierarchy with a noOverride templateSetting (ToDo: implement)
// 5) There must be no selection higher in the hierarchy with a noOverride selectionSetting (ToDo: implement)
const templateIsAppropriateForTabs = (bidControllerData, candidateTemplate, targetTemplate, productTemplate) => {
  // 1) One of these must be true:
  //    candidateTemplate has a templateRelationship where it is the child of targetTemplate.
  //    candidateTemplate has a templateRelationship where it is the child of productTemplate or a base template of productTemplate.
  let qualifyingRelationship = getAncestorRelationship(bidControllerData, candidateTemplate, targetTemplate, null);
  if (!qualifyingRelationship && productTemplate) {
    qualifyingRelationship = getAncestorRelationship(bidControllerData, candidateTemplate, productTemplate,
      [Constants.templateTypes.product, Constants.templateTypes.baseProduct]);
  }
  if (!qualifyingRelationship) {
    return false;
  }

  // 2) candidateTemplate cannot be a product (or base product)
  if (candidateTemplate.templateType === Constants.templateTypes.product) {
    return false;
  }

  return true;
};

const getTemplatesForTabs = (bidControllerData, selectionId) => {
  const {selections, templateLibraries} = bidControllerData;
  const selection = _.find(selections, (_selection) => _selection._id === selectionId);
  const selectionTemplate = getTemplateById(bidControllerData, selection.templateId);
  const productTemplate = selectionTemplate.templateType === Constants.templateTypes.productSelection
    ? getProductTemplate(bidControllerData, selectionId) : null;
  const templates = [];
  const templateToTemplateLibrary = {};
  _.each(templateLibraries, (templateLibrary) => {
    _.each(templateLibrary.templates, (template) => {
      if (templateIsAppropriateForTabs(bidControllerData, template, selectionTemplate, productTemplate)) {
        templates.push(template);
        templateToTemplateLibrary[template] = templateLibrary;
      }
    });
  });
  return _.sortBy(templates, (template) => {
    const templateLibrary = templateToTemplateLibrary[template];
    return getTemplateSettingByKeyAndIndex(bidControllerData, template.id, Constants.templateSettingKeys.displayOrder, 0);
  });
};

const addSelectOptions = (bidControllerData, selectOptions, template) => {
  if (!template)
      return;

  const selectionType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.selectionType);
  if (selectionType === Constants.selectionTypes.selectOption) {
    selectOptions.push({
      id: template.id,
      name: template.name
    });
  }

  const templateChildren = TemplateLibrariesHelper.getTemplateChildren(bidControllerData, template);
  _.each(templateChildren, (childTemplate) => {
    addSelectOptions(bidControllerData, selectOptions, childTemplate);
  });
}

//Traverse potentially all templates related to this one until one found with matching name
const getTemplateFromTemplateName = (bidControllerData, template, templateName, visitedTemplates) => {
  var templateRelationship;
  var returnTemplate;

  if (!template) {
    return null;
  }

  //Don't do anything if template has already been visited
  if (_.contains(visitedTemplates, template)) {
    return null;
  }

  if (template.name === templateName) {
    return template;
  }

  //Necessary to avoid infinite recursive loop
  visitedTemplates.push(template);

  //Check children (But don't bother with Children of sub-Templates)
  if (!ItemTemplatesHelper.isASubTemplate(template)) {
    const templateChildren = TemplateLibrariesHelper.getTemplateChildren(bidControllerData, template);
    _.find(templateChildren, (childTemplate) => {
      return getTemplateFromTemplateName(bidControllerData, childTemplate, templateName, visitedTemplates);
    });
  }

  //Now check parent(s)
  const templateParents = TemplateLibrariesHelper.getTemplateParents(bidControllerData, template);
  _.find(templateParents, (parentTemplate) => {
    return getTemplateFromTemplateName(bidControllerData, parentTemplate, templateName, visitedTemplates);
  });

  return null;
};

// const getLookupDataFromTemplateName = (bidControllerData, template, templateName) => {
//   var visitedTemplates = [];
//   var lookupDataTemplate = getTemplateFromTemplateName(bidControllerData, template, templateName, visitedTemplates);
//   if (lookupDataTemplate) {
//     return lookupDataTemplate.data;
//   }
//
//   return null;
// };

const populateLookupOptions = (bidControllerData, template, selectOptions) => {
  const {job, lookupData} = bidControllerData;
  const lookupType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.lookupType);
  if (lookupType !== Constants.lookupTypes.standard) {
    return;
  }
  const standardLookupData = lookupData && lookupData.standard;
  let valuesAdded = [];

  if (standardLookupData) {
    const lookupKey = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.lookupKey);
    if (!lookupKey) {
      return;
    }
    _.chain(standardLookupData)
    .filter((lookup) => lookup.lookupType === lookupType && lookup.key === lookupKey)
    .each((lookup) => {
      if (LookupsHelper.isValidLookup(lookupData, lookupType, lookupKey, lookup, job.pricingAt) &&
        !_.contains(valuesAdded, lookup.value)) {
        selectOptions.push({
          id: lookup.value,
          name: lookup.name,
          description: lookup.value,
        });
        valuesAdded.push(lookup.value);
      }
    });
  }
}

const populateCustomOptions = (bidControllerData, template, selectOptions) => {
  const {lookupData} = bidControllerData;
  const customOptions = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.customOptions);
  let sheetMaterialData;
  let skusAdded = [];

  if (customOptions) {
    if (customOptions === 'GetCoreSheetMaterialOptions') {
      sheetMaterialData = lookupData && lookupData['sheetMaterialData'];// getLookupDataFromTemplateName(templateLibrary, template, 'Sheet Material Data');

      if (sheetMaterialData) {
        sheetMaterialData.forEach(function (sheetMaterial) {
          if (sheetMaterial.coreMaterial && sheetMaterial.coreMaterial.sku) {
            if (!_.contains(skusAdded, sheetMaterial.coreMaterial.sku)) {
              selectOptions.push({
                id: sheetMaterial.coreMaterial.sku,
                name: sheetMaterial.coreMaterial.name,
                description: sheetMaterial.coreMaterial.description
              });
              skusAdded.push(sheetMaterial.coreMaterial.sku);
            }
          }
        });
      }
    } else if (customOptions === 'GetSpecificationOptions') {
      const templateChildren = TemplateLibrariesHelper.getTemplateChildren(bidControllerData, template);
      _.each(templateChildren, (childTemplate) => {
        if (childTemplate.templateType === Constants.templateTypes.condition) {
          const switchValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.switchValue);
          if (switchValue) {
            selectOptions.push({
              id: switchValue,
              name: switchValue,
              description: switchValue
            });
          }
        }
      });
    } else {
      throw new Error('Unexpected CustomOptions: ' + customOptions);
    }
  }
}

// populates select options if necessary. Returns select options
const populateSelectOptions = (bidControllerData, template, forceRefresh) => {
  if (!bidControllerData) {
    throw 'bidControllerData must be set in populateSelectOptions';
  }
  if (!template) {
    throw 'template must be set in populateSelectOptions';
  }

  const {metadata} = bidControllerData;
  if (!forceRefresh && metadata.selectOptions
    && metadata.selectOptions[template.id] && metadata.selectOptions[template.id].length > 0) {
    return metadata.selectOptions;
  }

  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, template.id);
  let selectOptions = [];

  if (ItemTemplatesHelper.isASubTemplate(template)) {
    const parentTemplate = TemplateLibrariesHelper.getTemplateParent(bidControllerData, template);
    if (parentTemplate) {
      selectOptions = populateSelectOptions(bidControllerData, parentTemplate, forceRefresh);
    }
  } else if (ItemTemplatesHelper.isABaseTemplate(template)) {
    addSelectOptions(bidControllerData, selectOptions, template);
  } else if (ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    template, Constants.templateSettingKeys.lookupType) === Constants.lookupTypes.standard) {
    populateLookupOptions(bidControllerData, template, selectOptions);
  } else {
    populateCustomOptions(bidControllerData, template, selectOptions);
  }

  metadata.selectOptions[template.id] = selectOptions;

  return selectOptions;
}

const populateTabPages = (bidControllerData, template) => {
  const {metadata} = bidControllerData;
  const selectOptions = metadata.selectOptions[template.id];
  const tabPageAll = {
    name: 'All',
    templateIds: [],
  };
  const tabPages = [tabPageAll];
  _.each(selectOptions, (selectOption) => {
    const selectOptionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selectOption.id);
    const selectOptionTabPageNames = ItemTemplatesHelper.getTemplateSettingValuesForTemplate(
      selectOptionTemplate, Constants.templateSettingKeys.displayCategory);

    // First put products on the All page
    if (!_.contains(tabPageAll.templateIds, selectOptionTemplate.id)) {
      tabPageAll.templateIds.push(selectOptionTemplate.id);
    }

    // Now add products to the explicitly identified tab pages
    _.each(selectOptionTabPageNames, (selectOptionTabPageName) => {
      const tabPage = _.find(tabPages, (_tabPage) => _tabPage.name === selectOptionTabPageName);
      if (tabPage) {
        if (!_.contains(tabPage.templateIds, selectOptionTemplate.id)) {
          tabPage.templateIds.push(selectOptionTemplate.id);
        }
      } else {
        tabPages.push({
          name: selectOptionTabPageName,
          templateIds: [selectOptionTemplate.id],
        });
      }
    });
  });
  metadata.tabPages = tabPages;
  return tabPages;
}

const getSelectOptions = (bidControllerData, template) => {
  const {metadata} = bidControllerData;
  if (metadata && metadata.selectOptions && template) {
    return metadata.selectOptions[template.id];
  }
}

const addUnitTemplateSettings = (bidControllerData, templateId, worksheetUnitValue, order) => {
  switch (worksheetUnitValue.toLowerCase()) {
    case 'ea':
      addTemplateSetting(bidControllerData, templateId, Constants.templateSettingKeys.numeratorUnit, UnitOfMeasure.units.dollars, order++);
      break;
    case 'pair':
    default:
      addTemplateSetting(bidControllerData, templateId, Constants.templateSettingKeys.numeratorUnit, UnitOfMeasure.units.dollars, order++);
      // addTemplateSetting(bidControllerData, templateId, Constants.templateSettingKeys.denominatorUnit, UnitOfMeasure.units.pair, order++);
      break;
  }

  return order;
}

const camelCase = (text) => {
  // only include spaces, characters, and digits prior to splitting
  const textArray = text.replace(/[^a-z0-9 ]/gi,'').split(' ');
  return _.map(textArray, (item, index) => {
    if (index === 0) {
      return item.toLowerCase();
    }
    else {
      return item.charAt(0).toUpperCase() + item.slice(1);
    }
  }).join('');
}

const addProductSkuSelectorTemplate = (bidControllerData, parentTemplate) => {
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, parentTemplate.id);
  let order = 0;
  const newTemplate = addTemplate(templateLibrary, Constants.templateTypes.input, parentTemplate);
  newTemplate.name = `${parentTemplate.name} Type`;
  newTemplate.description = newTemplate.name;
  const lookupKey = parentTemplate.name; // LookupsHelper.getLookupKey(parentTemplate.name);
  const variableName = camelCase(parentTemplate.name);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.selectionType, Constants.selectionTypes.select, order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.displayCategory, "Primary", order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.variableName, variableName, order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.lookupType, Constants.lookupTypes.standard, order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.lookupKey, lookupKey, order++);
  return newTemplate;
}

const addPriceTemplate = (bidControllerData, parentTemplate, defaultUnitsText, conditionSwitchVariable) => {
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, parentTemplate.id);
  let order = 0;
  const newTemplate = addTemplate(templateLibrary, Constants.templateTypes.override, parentTemplate);
  newTemplate.name = `${parentTemplate.name} Price Override`;
  // if parentTemplate.name is 'Metal Hinge' and conditionSwitchVariable is 'hardwareMaterial' we would want variableName = 'metalHinge{hardwareMaterial}'
  const variableName = conditionSwitchVariable
    ? `${camelCase(parentTemplate.name)}{${conditionSwitchVariable}}`
    : camelCase(parentTemplate.name);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.isVariableOverride, 'true', order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.variableToOverride, 'priceEach', order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.propertyToOverride, Constants.templateSettingKeys.valueFormula, order++);
  // addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.overrideValue, `[lookup]`, order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.lookupType, Constants.lookupTypes.price, order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.lookupKeyVariable, variableName, order++);
  return newTemplate;
}

// decided instead to add conditional switchVariable to addPriceTemplate
// const addConditionTemplate = (bidControllerData, parentTemplate, switchVariable, defaultSwitchValue) => {
//   const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, parentTemplate.id);
//   let order = 0;
//   const newTemplate = addTemplate(templateLibrary, Constants.templateTypes.condition, parentTemplate);
//   newTemplate.name = `${parentTemplate.name} Condition of ${switchVariable}`;
//   addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.conditionType, Constants.conditionTypes.switch, order++);
//   addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.switchVariable, switchVariable, order++);
//   addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.switchValue, defaultSwitchValue, order++);
//   return newTemplate;
// }

const cleanCellValue = (cellValue) => {
  if (typeof cellValue === 'string') {
    return cellValue.trim();
  }
  return cellValue;
}

const getCellValue = (startCellAddress, worksheet, offsetOptions) => {
  const {columnOffset, rowOffset} = offsetOptions;
  const cellAddress = {
    ...startCellAddress,
    c: startCellAddress.c + (columnOffset || 0),
    r: startCellAddress.r + (rowOffset || 0),
  };
  const cell = SpreadsheetUtils.encode_cell(cellAddress);
  return worksheet[cell] && cleanCellValue(worksheet[cell].v);
}

const getColumnValue = (column, rowStartCellAddress, worksheet) => {
  // 'if (column.columnOffset)' did not work because '(0)' is falsy
  if (typeof column.columnOffset === 'number') {
    return getCellValue(rowStartCellAddress, worksheet, column);
  } else if (column.value) {
    return column.value;
  }
  return undefined;
}

const getNameColumnValue = (workbookMappings, rowStartCellAddress, worksheet) => {
  const nameColumn = _.find(workbookMappings.columns, (column) => column.header && column.header.templateProperty && column.header.templateProperty === 'name');
  if (nameColumn) {
    return getColumnValue(nameColumn, rowStartCellAddress, worksheet);
  }
  // name is at columnOffset of 0 by default
  return getCellValue(rowStartCellAddress, worksheet, {});
}

const getConditionColumnValue = (workbookMappings, rowStartCellAddress, worksheet) => {
  const conditionSwitchColumn = _.find(workbookMappings.columns, (column) => column.header && column.header.conditionSwitchVariable);
  if (conditionSwitchColumn) {
    return getColumnValue(conditionSwitchColumn, rowStartCellAddress, worksheet);
  }
  // name is at columnOffset of 0 by default
  return getCellValue(rowStartCellAddress, worksheet, {});
}

const populateConditionSwitchValues = (conditionSwitchValues, worksheet, conditionSwitchColumn, startCellAddress) => {
  if (!conditionSwitchColumn) {
    return;
  }
  for (let columnIndex = 0; columnIndex < conditionSwitchColumn.columnCount; columnIndex++) {
    const conditionSwitchValue = getCellValue(
      startCellAddress,
      worksheet,
      {
        columnOffset: conditionSwitchColumn.columnOffset + columnIndex,
        rowOffset: conditionSwitchColumn.absoluteRowOffset
      });
    conditionSwitchValues.push(conditionSwitchValue);
  }
}

const addSpecificationOptionsFromWorkbook = (workbook, bidControllerData, lookups, templateParents, workbookMappings) => {
  const parentTemplate = templateParents && templateParents[0];
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, parentTemplate.id);
  if (!workbook) {
    throw 'workbook must be set in addSpecificationOptionsFromWorkbook';
  }
  const worksheet = workbook.Sheets[workbookMappings.sheet];
  const startCellAddress = SpreadsheetUtils.decode_cell(workbookMappings.startCell);
  console.log(`start cell = ${workbookMappings.startCell} = {r:${startCellAddress.r},c:${startCellAddress.c}} = "${worksheet[workbookMappings.startCell].v}"`);

  for (let columnOffset = 0; columnOffset < workbookMappings.columnCount; columnOffset++) {
    // const columnStartCellAddress = {...startCellAddress, c: startCellAddress.c + columnOffset};
    const newTemplateName = getCellValue(startCellAddress, worksheet, {columnOffset});
    if (!newTemplateName) {
      // _.any(templateLibrary.templates, (template) => template.name === newTemplateName))
      // ToDo: maybe we should update existing template or verify it matches
      continue;
    }

    const newTemplate = addTemplate(templateLibrary, Constants.templateTypes.input, parentTemplate);
    newTemplate.name = newTemplateName;
    newTemplate.description = newTemplateName;
    let order = 0;
    addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.selectionType, Constants.selectionTypes.select, order++);
    if (workbookMappings.category && workbookMappings.category.name) {
      addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.displayCategory, workbookMappings.category.name, order++);
    }
    const variableName = camelCase(newTemplateName);
    const lookupKey = newTemplateName;
    addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.variableName, variableName, order++);
    addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.lookupType, Constants.lookupTypes.standard, order++);
    addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.lookupKey, lookupKey, order++);
    _.each(templateParents, (templateParent, index) => {
      // First templateParent relationship was created by addTemplate call
      if (index > 0) {
        templateLibrary.templateRelationships.push({
          id: Random.id(),
          parentTemplateId: templateParent.id,
          childTemplateId: newTemplate.id,
          dependency: Constants.dependency.optionalOverride,
        });
      }
    });
    let defaultValue;
    // Start with rowOffset of 1 because first row is the header containing the template name
    for (let rowOffset = 1; rowOffset < workbookMappings.rowCount; rowOffset++) {
      const specificationOption = getCellValue(startCellAddress, worksheet, {columnOffset, rowOffset});
      if (!specificationOption) {
        // Expect blank rows, just ignore them
        continue;
      }
      if (!defaultValue) {
        defaultValue = specificationOption;
        addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.defaultValue, defaultValue, order++);
      }
      LookupsHelper.addOptionLookup(templateLibrary, lookups, newTemplateName, specificationOption);
    }
  }
};

const addProductsFromWorkbook = (workbook, bidControllerData, lookups, parentTemplate, workbookMappings) => {
  const templateLibrary = getTemplateLibraryWithTemplate(bidControllerData, parentTemplate.id);
  if (!workbook) {
    throw 'workbook must be set in addProductsFromWorkbook';
  }
  const worksheet = workbook.Sheets[workbookMappings.sheet];
  let startCellAddress = SpreadsheetUtils.decode_cell(workbookMappings.startCell);
  console.log(`start cell = ${workbookMappings.startCell} = {r:${startCellAddress.r},c:${startCellAddress.c}} = "${worksheet[workbookMappings.startCell].v}"`);

  const newTemplateName = workbookMappings.generalProductName;
  if (!newTemplateName ||
    _.any(templateLibrary.templates, (template) => template.name === newTemplateName)) {
    // ToDo: maybe we should update existing template or verify it matches
    return;
  }

  const newTemplate = addTemplate(templateLibrary, Constants.templateTypes.product, parentTemplate);
  newTemplate.name = newTemplateName;
  newTemplate.description = newTemplateName;
  let order = 0;
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.selectionType, Constants.selectionTypes.selectOption, order++);
  addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.isASubTemplate, 'true', order++);
  if (workbookMappings.category && workbookMappings.category.name) {
    addTemplateSetting(bidControllerData, newTemplate.id, Constants.templateSettingKeys.displayCategory, workbookMappings.category.name);
  }
  const conditionSwitchColumn = _.find(workbookMappings.columns, (column) => column.header && column.header.conditionSwitchVariable);
  const conditionSwitchVariable = conditionSwitchColumn && conditionSwitchColumn.conditionSwitchVariable;
  const conditionSwitchValues = [];
  populateConditionSwitchValues(conditionSwitchValues, worksheet, conditionSwitchColumn, startCellAddress);
  addProductSkuSelectorTemplate(bidControllerData, newTemplate);
  addPriceTemplate(bidControllerData, newTemplate, workbookMappings.defaultUnits, conditionSwitchVariable);

  for (let i = 0; i < workbookMappings.rowCount; i++) {
    const rowStartCellAddress = {...startCellAddress, r: startCellAddress.r + i};
    const rowStartCell = SpreadsheetUtils.encode_cell(rowStartCellAddress);
    const rowStartCellValue = worksheet[rowStartCell] && worksheet[rowStartCell].v;
    // Expect blank rows, just ignore them
    if (!rowStartCellValue) {
      continue;
    }

    const itemName = getNameColumnValue(workbookMappings, rowStartCellAddress, worksheet);
    if (!itemName) {
      // ||
      // _.any(templateLibrary.templates, (template) => template.name === itemName)) {
      // ToDo: maybe we should update existing template or verify it matches
      continue;
    }

    let unitsText;
    let description;
    _.each(workbookMappings.columns, (column) => {
      const columnValue = getColumnValue(column, rowStartCellAddress, worksheet);
      if (columnValue) {
        // if (column.header.templateProperty) {
        //   newTemplate[column.header.templateProperty] = columnValue;
        // } else if (column.header.templateSettingKey) {
        //   addTemplateSetting(templateLibrary, newTemplate.id, column.header.templateSettingKey, columnValue, order++);
        // } else
        if (column.header.customProperty) {
          switch (column.header.customProperty) {
            case 'unit':
              unitsText = columnValue || '[none]';
              // order = addUnitTemplateSettings(bidControllerData, newTemplate.id, columnValue, order);
              break;
            case 'description':
              description = columnValue;
              // order = addUnitTemplateSettings(bidControllerData, newTemplate.id, columnValue, order);
              break;
            case 'price':
              if (!unitsText) {
                throw `a unit customProperty must be defined before a price customProperty`;
              }
              if (conditionSwitchColumn) {
                for (let columnIndex = 0; columnIndex < conditionSwitchColumn.columnCount; columnIndex++) {
                  const productSku = `${newTemplate.name}${conditionSwitchValues[columnIndex]}`;
                  const productName = `${itemName} - ${conditionSwitchValues[columnIndex]}`;
                  const productDescription = description && `${description} - ${conditionSwitchValues[columnIndex]}`;
                  LookupsHelper.addPriceLookup(templateLibrary, lookups, newTemplate.name, productSku, productName, description, columnValue, unitsText);
                }
              } else {
                LookupsHelper.addPriceLookup(templateLibrary, lookups, newTemplate.name, itemName, itemName, description, columnValue, unitsText);
              }
              break;
            default:
              throw `'${column.header.customProperty}' is not a valid customProperty`;
          }
        }
      }
    });
    LookupsHelper.addProductSkuLookup(templateLibrary, lookups, newTemplate.name, itemName, itemName, description);
  }
}
//
// const getIconStack2xClass = (lookupType) => {
//   return "fa fa-circle-o fa-stack-2x";
// };
//
// const getIconStack1xClass = (lookupType) => {
//   switch (lookupType) {
//     case Constants.lookupTypes.label:
//       return "fa fa-ellipsis-h fa-stack-1x";
//     case Constants.lookupTypes.price:
//       return "fa fa-dollar fa-stack-1x";
//     case Constants.lookupTypes.standard:
//     default:
//       return "fa fa-arrow-up fa-stack-1x";
//   }
// };
//
// const getStackedIcon = (lookupType) => {
//   return `<span class="fa-stack">
//       <i class="${getIconStack2xClass(lookupType)}"></i>
//       <i class="${getIconStack1xClass(lookupType)}"></i>
//     </span>`;
// };

const getTemplateLibraryOptions = ({templateLibraries}, $filter, selectedTemplateLibraryId) => {
  return _.chain(templateLibraries)
    .sortBy((templateLibrary) => templateLibrary.createdAt)
    .reverse()
    .map((templateLibrary, index) => {
      const createdAt = $filter('amDateFormat')(templateLibrary.createdAt, 'MMM Do, YYYY');
      return {
        _id: templateLibrary._id,
        icon: "<span></span>",
        name: `${templateLibrary.name} - ${createdAt}`,
        ticked: (selectedTemplateLibraryId && templateLibrary._id === selectedTemplateLibraryId) ||
          (!selectedTemplateLibraryId && index === 0)
      };
    })
    .value();
}

TemplateLibrariesHelper = {
  addProductsFromWorkbook,
  addSpecificationOptionsFromWorkbook,
  addTemplate,
  addTemplateSetting,
  cloneTemplateLibrary,
  deleteTemplate,
  deleteTemplateSetting,
  getAllSubTemplatesOfBaseTemplateChild,
  getChildTemplateRelationships,
  getParentTemplateRelationships,
  getRootTemplate,
  getSelectOptions,
  getTemplateById,
  getTemplateByType,
  getTemplateChildren,
  getTemplateLibraryOptions,
  getTemplateLibraryWithTemplate,
  getTemplateRelationshipById,
  getTemplateSettingByIds,
  getTemplateSettingByKeyAndIndex,
  getTemplateSettingByTemplateAndKeyAndIndex,
  getTemplatesByTemplateSetting,
  getTemplatesForTabs,
  getTemplateSettingsForTabs,
  getTemplateParent,
  getTemplateParents,
  populateSelectOptions,
  populateTabPages,
}
