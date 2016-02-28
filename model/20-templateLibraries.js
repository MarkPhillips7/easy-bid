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

function getTemplateRelationshipById(templateLibrary, templateRelationshipId) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getTemplateRelationshipById';
  }
  return _.find(vm.templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.id === templateRelationshipId;
  });
}

function getParentTemplateRelationships(templateLibrary, childTemplateId, dependenciesToIgnore) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getParentTemplateRelationships';
  }
  if (!childTemplateId) {
    throw 'childTemplateId must be set in getParentTemplateRelationships';
  }

  return _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.childTemplateId === childTemplateId
      && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
  });
}

function getChildTemplateRelationships(templateLibrary, parentTemplateId, dependenciesToIgnore) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getChildTemplateRelationships';
  }
  if (!parentTemplateId) {
    throw 'parentTemplateId must be set in getChildTemplateRelationships';
  }

  return _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
    return templateRelationship.parentTemplateId === parentTemplateId
      && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
  });
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

function parentTemplates(templateLibrary, template, dependenciesToIgnore) {
  var parentTemplates = [];

  if (templateLibrary && template) {
    var parentTemplateRelationships = _.filter(templateLibrary.templateRelationships, function (templateRelationship) {
      return templateRelationship.childTemplateId === template.id
        && (!dependenciesToIgnore || !_.contains(dependenciesToIgnore, templateRelationship.dependency));
    })

    parentTemplates = _.map(parentTemplateRelationships, function (templateRelationship) {
      return _.find(templateLibrary.templates, function (templ) {
        return templ.id == templateRelationship.parentTemplateId;
      })
    });
  }

  return parentTemplates;
}

function templateChildren(templateLibrary, template, dependenciesToIgnore) {
  var templateChildren = [];

  if (templateLibrary && template) {
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
const getTemplateById = (templateLibraryOrList, templateId) => {
  if (!templateLibraryOrList) {
    throw 'templateLibraryOrList must be set in getTemplateById';
  }

  const templateLibraries = _.isArray(templateLibraryOrList) ? templateLibraryOrList : [templateLibraryOrList];
  let template = null;
  _.find(templateLibraries, (templateLibrary) => {
    template = _.find(templateLibrary.templates, (template) => template.id === templateId);
    return template && templateLibrary;
  });
  return template;
}

const getTemplateByType = (templateLibraryOrList, templateType) => {
  if (!templateLibraryOrList) {
    throw 'templateLibraryOrList must be set in getTemplateByType';
  }
  if (!templateType) {
    throw 'templateType must be set in getTemplateByType';
  }

  const templateLibraries = _.isArray(templateLibraryOrList) ? templateLibraryOrList : [templateLibraryOrList];
  let template = null;
  _.find(templateLibraries, (templateLibrary) => {
    template = _.find(templateLibrary.templates, (template) => template.templateType === templateType);
    return template && templateLibrary;
  });
  return template;
};

const getTemplatesByTemplateSetting = (templateLibraryOrList, templateSettingKey, templateSettingValue) => {
  if (!templateLibraryOrList) {
    throw 'templateLibraryOrList must be set in getTemplatesByTemplateSetting';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in getTemplatesByTemplateSetting';
  }
  if (!templateSettingValue) {
    throw 'templateSettingValue must be set in getTemplatesByTemplateSetting';
  }

  const templateLibraries = _.isArray(templateLibraryOrList) ? templateLibraryOrList : [templateLibraryOrList];
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

function getTemplateSettingByIds(templateLibrary, templateId, templateSettingId) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getTemplateSettingByIds';
  }
  if (!templateId) {
    throw 'templateId must be set in getTemplateSettingByIds';
  }
  if (!templateSettingId) {
    throw 'templateSettingId must be set in getTemplateSettingByIds';
  }
  var template=getTemplateById(templateLibrary, templateId);
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

function getTemplateSettingByKeyAndIndex(templateLibrary, templateId, templateSettingKey, templateSettingIndex) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getTemplateSettingByKeyAndIndex';
  }
  if (!templateId) {
    throw 'templateId must be set in getTemplateSettingByKeyAndIndex';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in getTemplateSettingByKeyAndIndex';
  }
  var template = getTemplateById(templateLibrary, templateId);

  return getTemplateSettingByTemplateAndKeyAndIndex(template, templateSettingKey, templateSettingIndex);
}

function addTemplateSetting(templateLibrary, templateId, templateSettingKey, templateSettingValue, order) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in addTemplateSetting';
  }
  if (!templateId) {
    throw 'templateId must be set in addTemplateSetting';
  }
  if (!templateSettingKey) {
    throw 'templateSettingKey must be set in addTemplateSetting';
  }
  var template = getTemplateById(templateLibrary,templateId);
  if (!template) {
    throw `no template found for template ${templateId} in templateLibrary ${templateLibrary._id} in addTemplateSetting`;
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

function deleteTemplateSetting(templateLibrary, templateId, templateSettingId) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getTemplateSettingByIds';
  }
  if (!templateId) {
    throw 'templateId must be set in getTemplateSettingByIds';
  }
  if (!templateSettingId) {
    throw 'templateSettingId must be set in getTemplateSettingByIds';
  }
  var template = getTemplateById(templateLibrary,templateId);
  if (!template) {
    throw 'no template found for templateId';//`no template found for template ${templateId} in templateLibrary ${templateLibrary._id}`;
  }
  var templateSetting=getTemplateSettingByIds(templateLibrary,templateId,templateSettingId);
  if (!templateSetting) {
    throw 'no templateSetting found for templateSettingId';//`no template found for template ${templateId} in templateLibrary ${templateLibrary._id}`;
  }

  template.templateSettings.splice(template.templateSettings.indexOf(templateSetting), 1);
}

function deleteTemplate(templateLibrary, templateId) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in deleteTemplate';
  }
  var template = getTemplateById(templateLibrary, templateId);
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

function getAllSubTemplatesOfBaseTemplateChild(templateLibrary, template) {
  if (!templateLibrary) {
    throw 'templateLibrary must be set in getAllSubTemplatesOfBaseTemplateChild';
  }
  if (!template) {
    throw `template must be set in getAllSubTemplatesOfBaseTemplateChild`;
  }

  var subTemplateList = [];

  var baseTemplateChild = _.chain(TemplateLibrariesHelper.templateChildren(templateLibrary, template))
    .find((childTemplate) => { return ItemTemplatesHelper.isABaseTemplate(childTemplate); })
    .value();

  populateSubTemplateListWithTemplateChildren(templateLibrary, baseTemplateChild, subTemplateList);

  return subTemplateList;
}

function populateSubTemplateListWithTemplateChildren(templateLibrary, template, subTemplateList) {
  _.each(TemplateLibrariesHelper.templateChildren(templateLibrary, template),
    (childTemplate) => {
      if (ItemTemplatesHelper.isASubTemplate(childTemplate)) {
        subTemplateList.push(childTemplate);
        populateSubTemplateListWithTemplateChildren(templateLibrary, childTemplate, subTemplateList);
      }
    });
}

TemplateLibrariesHelper = {
  addTemplate: addTemplate,
  addTemplateSetting: addTemplateSetting,
  cloneTemplateLibrary: cloneTemplateLibrary,
  deleteTemplate: deleteTemplate,
  deleteTemplateSetting: deleteTemplateSetting,
  getAllSubTemplatesOfBaseTemplateChild: getAllSubTemplatesOfBaseTemplateChild,
  getChildTemplateRelationships: getChildTemplateRelationships,
  getParentTemplateRelationships: getParentTemplateRelationships,
  getRootTemplate: getRootTemplate,
  getTemplateById: getTemplateById,
  getTemplateByType: getTemplateByType,
  getTemplateRelationshipById: getTemplateRelationshipById,
  getTemplateSettingByIds: getTemplateSettingByIds,
  getTemplateSettingByKeyAndIndex: getTemplateSettingByKeyAndIndex,
  getTemplateSettingByTemplateAndKeyAndIndex: getTemplateSettingByTemplateAndKeyAndIndex,
  getTemplatesByTemplateSetting: getTemplatesByTemplateSetting,
  parentTemplate: parentTemplate,
  parentTemplates: parentTemplates,
  templateChildren: templateChildren
}
