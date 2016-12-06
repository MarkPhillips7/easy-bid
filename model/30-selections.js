import {Parser} from 'expr-eval';

Selections = new Mongo.Collection("selections");

Schema.SelectionSetting = new SimpleSchema({
  key: {
    type: String,
  },
  value: {
    type: String,
    optional: true,
  },
  // suppose selection is a product selection, levelFromHere would be
  // -4 if override from company, -2 if job, -1 if area, 1 if cabinet, 2 if lazy susan cabinet.
  // Override should only apply if levelFromHere > [previous levelFromHere]
  levelFromHere: {
    type: Number,
    optional: true,
  },
  overrideType: {
    type: String,
    optional: true,
  }
});

Schema.Selection = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  },
  valueSource: {
    type: String,
    optional: true
  },
  jobId: {
    type: String,
    optional: true
  },
  templateLibraryId: {
    type: String
  },
  templateId: {
    type: String
  },
  selectionSettings: {
    type: [Schema.SelectionSetting],
    optional: true
  },
  isOverridingDefault: {
    type: Boolean,
    defaultValue: false
  }
});

Selections.attachSchema(Schema.Selection);

SelectionRelationships = new Mongo.Collection("selectionRelationships");

Schema.SelectionRelationship = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  jobId: {
    type: String,
    optional: true
  },
  parentSelectionId: {
    type: String
  },
  childSelectionId: {
    type: String
  },
  order: {
    type: Number,
    optional: true
  }
});

SelectionRelationships.attachSchema(Schema.SelectionRelationship);

Selections.allow({
  insert: function (userId, selection) {
    return Meteor.call('userCanUpdateJob', userId, selection.jobId);
  },
  update: function (userId, selection, fields, modifier) {
    return Meteor.call('userCanUpdateJob', userId, selection.jobId);
  },
  remove: function (userId, selection) {
    return false;
  }
});

function getChildSelections(selection, bidControllerData) {
  const {selections, selectionRelationships} = bidControllerData;
  if (!selection) {
    throw 'selection must be set in getChildSelections';
  }

  if (selections && selectionRelationships) {
    let childSelectionIds = _.chain(selectionRelationships)
      .filter((relationship) => relationship.parentSelectionId === selection._id)
      .map((relationship) => relationship.childSelectionId)
      .value();
    return _.filter(selections, (selection) => _.indexOf(childSelectionIds, selection._id) !== -1);
  } else {
    let childSelectionIds = SelectionRelationships.find({parentSelectionId: selection._id})
      .map(function(relationship){
        return relationship.childSelectionId;
      });
    return Selections.find({_id: { $in: childSelectionIds } }).fetch();
  }
}

function getChildSelectionsWithTemplateId(selection, templateId, bidControllerData) {
  const {selections, selectionRelationships} = bidControllerData;
  if (!selection) {
    throw 'selection must be set in getChildSelectionsWithTemplateId';
  }
  if (!templateId) {
    throw 'templateId must be set in getChildSelectionsWithTemplateId';
  }

  if (selections && selectionRelationships) {
    const childSelectionIds = _.chain(selectionRelationships)
        .filter((selectionRelationship) => selectionRelationship.parentSelectionId === selection._id)
        .map((selectionRelationship) => selectionRelationship.childSelectionId)
        .value();
    return _.filter(selections, (_selection) => _selection.templateId === templateId &&
        _.some(childSelectionIds, (childSelectionId) => childSelectionId === _selection._id));
  } else {
    const childSelectionIds = SelectionRelationships.find({parentSelectionId: selection._id})
      .map(function(relationship){
        return relationship.childSelectionId;
      });
    return Selections.find(
      {
        _id: { $in: childSelectionIds },
        templateId: templateId
      }).fetch();
    }
}

function getParentSelections(selection, bidControllerData) {
  const {selections, selectionRelationships} = bidControllerData;
  if (!selection) {
    throw 'selection must be set in getParentSelections';
  }

  if (selections && selectionRelationships) {
    let parentSelectionIds = _.chain(selectionRelationships)
      .filter((relationship) => relationship.childSelectionId === selection._id)
      .map((relationship) => relationship.parentSelectionId)
      .value();
    return _.filter(selections, (selection) => _.indexOf(parentSelectionIds, selection._id) !== -1);
  } else {
    let parentSelectionIds = SelectionRelationships.find({childSelectionId: selection._id})
      .map(function(relationship){
        return relationship.parentSelectionId;
      });
    return Selections.find({_id: { $in: parentSelectionIds } }).fetch();
  }
}

// Return getSelectionToOverride as long as that selection's variableCollectorSelection matches the original
// selection's variableCollectorSelection. If not add new selection under variableCollectorSelection.
function getSelectionToOverrideOrAddIfAppropriate(bidControllerData, selection, variableToOverride,
  selectionIdsToIgnore, selectionValue, overrideTemplate) {
  let returnValue = getSelectionToOverride(bidControllerData, selection, variableToOverride, selectionIdsToIgnore, 0);
  // If no selectionToOverride was found just give up.
  if (!returnValue || !returnValue.selectionToOverride) {
    return returnValue;
  }

  const expectedVariableCollectorSelection = getVariableCollectorSelection(bidControllerData, selection);
  const selectionToOverrideVariableCollectorSelection = getVariableCollectorSelection(bidControllerData, returnValue.selectionToOverride);
  if (expectedVariableCollectorSelection === selectionToOverrideVariableCollectorSelection) {
    return returnValue;
  }

  // selectionToOverride belongs to a different variableCollectorSelection, so create a new selection.
  // ToDo: ensure that newSelectionTemplate can be a child of expectedVariableCollectorSelection's template.
  const newSelectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, returnValue.selectionToOverride.templateId);
  const newSelection = addSelectionsForTemplateAndChildren(bidControllerData, newSelectionTemplate, selectionValue,
    expectedVariableCollectorSelection, 0, Constants.selectionAddingModes.handleAnything, null);

  // store the overrideTemplate id responsible so that we know whether it was from a specification group
  addOrUpdateSelectionSettings(newSelection, [ { key: Constants.selectionSettingKeys.overrideTemplateId, value: overrideTemplate.id } ]);

  // There is no longer a selectionToOverride since a new selection was created.
  return {selectionToOverride: null, levelFromHere: 0};
}

// Return the first selection most closely related to this selection whose template defines a variable named variableToOverride.
// First check if this selection could be it, then child selections, then parent selections.
function getSelectionToOverride(bidControllerData, selection, variableToOverride, selectionIdsToIgnore, levelFromHere) {
  let returnValue = {selectionToOverride: null, levelFromHere};

  if (!_.contains(selectionIdsToIgnore, selection._id)) {
    selectionIdsToIgnore.push(selection._id);

    let selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);

    //First check selection
    if (selectionTemplate &&
      ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.variableName)
      === variableToOverride) {
      returnValue.selectionToOverride = selection;
    }

    //Next check child selections that are not sub templates and not variable collectors
    if (!returnValue.selectionToOverride) {
      let childSelections = SelectionsHelper.getChildSelections(selection, bidControllerData);
      if (childSelections) {
        childSelections.forEach(function (childSelection) {
          const childSelectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, childSelection.templateId);
          if (!returnValue.selectionToOverride && childSelectionTemplate &&
            !ItemTemplatesHelper.getTemplateSettingValueForTemplate(childSelectionTemplate, Constants.templateSettingKeys.isVariableCollector) &&
            !ItemTemplatesHelper.isASubTemplate(childSelectionTemplate)) {
            returnValue = getSelectionToOverride(bidControllerData, childSelection, variableToOverride,
              selectionIdsToIgnore, levelFromHere - 1);
          }
        });
      }
    }

    //Next check selections of base templates?

    //Lastly check parent selections as long as selection is not a variable collector
    if (!returnValue.selectionToOverride) {
      const isVariableCollector = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.isVariableCollector);
      let parentSelections = SelectionsHelper.getParentSelections(selection, bidControllerData);
      if (parentSelections) {
        parentSelections.forEach(function (parentSelection) {
          if (!returnValue.selectionToOverride) {
            returnValue = getSelectionToOverride(bidControllerData, parentSelection, variableToOverride,
              selectionIdsToIgnore, levelFromHere + 1);
          }
        });
      }
    }
  }

  return returnValue;
}

//Populate an array of template IDs including template.id and, if it is a base template or a sub template, any sub template IDs.
function populateTemplateIds(templateLibrary, templateIds, template, onlyIfBaseOrSubTemplate) {
  const isABaseTemplate = ItemTemplatesHelper.isABaseTemplate(template);
  const isASubTemplate = ItemTemplatesHelper.isASubTemplate(template);
  if (!onlyIfBaseOrSubTemplate ||
      isABaseTemplate ||
      isASubTemplate) {
      templateIds.push(template.id);
  }

  //Now include template IDs for children if this is a base template or a sub template
  if (isABaseTemplate || isASubTemplate) {
    _.each(TemplateLibrariesHelper.getTemplateChildren({templateLibraries: [templateLibrary]}, template), (childTemplate) => {
      populateTemplateIds(templateLibrary, templateIds, childTemplate, true);
    });
  }
};

//Return array of all selections that are children (or grandchildren, Etc.) that match template.
function getSelectionsBySelectionParentAndTemplate(bidControllerData, selectionParent, template) {
  const {templateLibraries, selections} = bidControllerData;
  var templateIds = [];
  if (typeof selectionParent === 'string') {
    selectionParent = _.find(selections, (selection) => selection._id === selectionParent);
  }
  _.each(templateLibraries, (templateLibrary) => {
    populateTemplateIds(templateLibrary, templateIds, template, false);
  });

  return getSelectionsBySelectionParentAndTemplateIds(bidControllerData, selectionParent, templateIds);
};

function getSelectionsBySelectionParentAndTemplateIds(bidControllerData, selectionParent, templateIds) {
  const {templateLibraries, selections, selectionRelationships} = bidControllerData;
  var selectionsToReturn = [];

  populateSelectionsBySelectionParent(selectionParent);
  return selectionsToReturn;

  function populateSelectionsBySelectionParent(selectionParent) {
    if (selectionParent) {
      const childSelections = getChildSelections(selectionParent, bidControllerData);
      _.each(childSelections, (childSelection) => {
        if (_.contains(templateIds, childSelection.templateId)) {
          selectionsToReturn.push(childSelection);
        } else {
          const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, childSelection.templateId);
          if (selectionTemplate &&
              !SelectionsHelper.getSettingValue(childSelection, selectionTemplate,
              Constants.templateSettingKeys.isVariableCollector)) {
            // Check for descendent selections for the template. Often the desired selection is a grandchild of the original selectionParent.
            populateSelectionsBySelectionParent(childSelection);
          }
        }
      });
    }
  }
};

const getVariableCollectorSelection = (bidControllerData, selection) => {
  const {templateLibraries, selections, selectionRelationships} = bidControllerData;
  if (!templateLibraries || !selection) {return null;}

  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
  if (selectionTemplate &&
    ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.isVariableCollector)) {
    return selection;
  }

  const parentSelection = SelectionsHelper.getParentSelections(selection, bidControllerData)[0];
  if (parentSelection) {
    return getVariableCollectorSelection(bidControllerData, parentSelection);
  }

  return null;
}

//Create variable (if ValueFormula template setting exists) for selection and its children.
function createSelectionVariables(bidControllerData, selection) {
  const {metadata} = bidControllerData;
  if (!selection) {
    return;
  }
  var childSelections = getChildSelections(selection, bidControllerData);

  _.each(childSelections, (childSelection) => {
    createSelectionVariables(bidControllerData, childSelection);
  });

  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
  if (!selectionTemplate) {
    return;
  }

  const jsonVariableName = ItemTemplatesHelper.getJsonVariableName(selectionTemplate);
  if (!jsonVariableName) {
    return;
  }

  const variableCollectorSelection = getVariableCollectorSelection(bidControllerData, selection);
  if (!variableCollectorSelection) {
    return;
  }

  // Create variable for VariableName if appropriate. ToDo: update to handle more than one parent?!!!
  metadata.variables[variableCollectorSelection._id] = metadata.variables[variableCollectorSelection._id] || {};
  var variable = metadata.variables[variableCollectorSelection._id][jsonVariableName];
  if (variable === undefined) {
    //initialize to null
    metadata.variables[variableCollectorSelection._id][jsonVariableName] = null;
  }
}

const getSelectionByTemplate = (bidControllerData, template) => {
  const {selections} = bidControllerData;
  if (template) {
    // console.log(`looking for selection for template.id ${template.id}`);
    return _.find(selections, (selection) => selection.templateId === template.id);
  }
  return null;
};

//If there can be more than one setting value for selection, create and then use getSelectionSettingValuesForSelection instead(Actually need to probably sort somehow in the case of multiple overrides).
const getSelectionSettingValueForSelection = (selection, selectionSettingKey) => {
  if (selection && selectionSettingKey) {
    const selectionSetting = _.filter(selection.selectionSettings, (selectionSetting) => {
      return (selectionSetting.key === selectionSettingKey);
    })[0];
    if (selectionSetting) {
      return selectionSetting.value;
    }
  }

 return null;
};

const getSettingValue = (selection, selectionTemplate, settingKey) => {
  // SelectionSettings overrides the template setting, so check it first
  let returnValue = getSelectionSettingValueForSelection(selection, settingKey);

  if (returnValue === null && selectionTemplate) {
    returnValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
      selectionTemplate, settingKey);
  }

  return returnValue;
};

const addSelectionReferencingVariable = (bidControllerData, jsonVariableName,
  selectionReferencingVariable, variableCollectorSelection) => {
  const {metadata} = bidControllerData;
  if (!metadata.selectionIdsReferencingVariables[variableCollectorSelection._id]) {
    metadata.selectionIdsReferencingVariables[variableCollectorSelection._id] = [];
  }
  const selectionIdsReferencingVariable = _.find(metadata.selectionIdsReferencingVariables[variableCollectorSelection._id],
    (selectionIdsReferencingVariable) => {
      return selectionIdsReferencingVariable.jsonVariableName === jsonVariableName;
    });
  if (selectionIdsReferencingVariable) {
    if (!_.find(selectionIdsReferencingVariable.selectionIds, (selectionId) => selectionReferencingVariable._id === selectionId)) {
      selectionIdsReferencingVariable.selectionIds.push(selectionReferencingVariable._id);
    }
  } else {
    metadata.selectionIdsReferencingVariables[variableCollectorSelection._id].push({
      jsonVariableName,
      selectionIds: [selectionReferencingVariable._id]
    });
  }
}

// selectionReferencingVariable is optional
const getJsonVariableValue = (bidControllerData, selection, jsonVariableName, selectionReferencingVariable) => {
  const {metadata} = bidControllerData;
  var variableCollectorSelection = selection
    ? getVariableCollectorSelection(bidControllerData, selection)
    : null;
  if (variableCollectorSelection) {
    metadata.variables[variableCollectorSelection._id] = metadata.variables[variableCollectorSelection._id] || {};
    let variableValue = metadata.variables[variableCollectorSelection._id][jsonVariableName];
    if (variableValue !== undefined) {
      if (selectionReferencingVariable && variableCollectorSelection._id !== selectionReferencingVariable._id) {
        addSelectionReferencingVariable(bidControllerData, jsonVariableName, selectionReferencingVariable, variableCollectorSelection);
      }

      return variableValue;
    }

    // variableCollectorSelection does not contain variable, so check its parent.
    const parentSelection = SelectionsHelper.getParentSelections(variableCollectorSelection, bidControllerData)[0];
    if (parentSelection) {
      variableValue = getJsonVariableValue(bidControllerData, parentSelection, jsonVariableName, selectionReferencingVariable);
      // copy parent's variable value into this variable collector's variable value
      //metadata.variables[variableCollectorSelection._id][jsonVariableName] = variableValue;
      return variableValue;
    }
  }

  return undefined;
};

const refreshSelectionsReferencingVariable = (bidControllerData, variableCollectorSelection, jsonVariableName) => {
  const {metadata, selections} = bidControllerData;
  // Make sure formulas that reference selection's variable get updated
  if (metadata.selectionIdsReferencingVariables[variableCollectorSelection._id]) {
    const selectionIdsReferencingVariable = _.find(metadata.selectionIdsReferencingVariables[variableCollectorSelection._id],
      (selectionIdsReferencingVariable) => {
        return (selectionIdsReferencingVariable.jsonVariableName === jsonVariableName);
    });

    if (selectionIdsReferencingVariable) {
      _.each(selectionIdsReferencingVariable.selectionIds, (selectionId) => {
        const selectionReferencingVariable = _.find(selections, (_selection) => _selection._id === selectionId);
        if (selectionReferencingVariable) {
          SelectionsHelper.getSelectionValue(bidControllerData, selectionReferencingVariable);
        }
      });
    }
  }
};

// const sumSelections = (templateLibraries, selections, selectionRelationships,
//     metadata, selectionsToSum, parameterVariable, selectionReferencingVariable) => {
//   if (!selectionsToSum) {
//     return 0;
//   }
//
//   const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(parameterVariable);
//   const add = (previousValue, selection) => {
//     const jsonVariableValue = SelectionsHelper.getJsonVariableValue(
//       templateLibraries, selections, selectionRelationships, metadata,
//       selection, jsonVariableName, selectionReferencingVariable);
//     return previousValue + jsonVariableValue;
//   };
//
//   return selectionsToSum.reduce(add, 0);
// };

// const getLookupValue = (templateLibraries, selections, selectionRelationships, metadata, lookupData,
//     selection, selectionTemplate) => {
//   const lookupType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.lookupType);
//   let lookupKey = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.lookupKey);
//   if (!lookupKey) {
//     const lookupKeyVariable = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.lookupKeyVariable);
//     const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(lookupKeyVariable);
//     lookupKey = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
//         selection, jsonVariableName, selection);
//   }
//   return LookupsHelper.getLookupValue(lookupData, lookupType, lookupKey);
// }

const replaceValueFormulaLookupValues = (bidControllerData, selection, valueFormula, selectionReferencingVariable) => {
  const {job, lookupData, metadata} = bidControllerData;
  // expecting valueFormula like `getLookup${lookupType}(${lookupKey})`, for example `getLookupPrice(drawerSlides)`
  if (valueFormula) {
    const lookupMatches = Formulas.findLookups(valueFormula);
    if (lookupMatches) {
      _.each(lookupMatches, (lookupMatch) => {
        const {lookupType, templateVariableName} = Formulas.parseLookupInfo(lookupMatch);
        if (lookupType && templateVariableName) {
          const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
          const jsonVariableValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selectionReferencingVariable);
          const lookupValue = LookupsHelper.getLookupValue(lookupData, lookupType, jsonVariableValue, job.pricingAt) || '0';
          valueFormula = valueFormula.replace(lookupMatch, lookupValue);
        }
      });
    }
  }
  return valueFormula;
}

const calculateFormulaValue = (bidControllerData, selection, valueFormula, selectionReferencingVariable) => {
  const {metadata} = bidControllerData;
  if (!selection) {
    return 0;
  }

  valueFormula = replaceValueFormulaLookupValues(bidControllerData, selection, valueFormula, selectionReferencingVariable);
  const expr = Parser.parse(valueFormula);
  let formulaValue = 0;
  let variableValues = {};
  let allVariableValuesFound = true;
  expr.variables().forEach((templateVariableName) => {
    if (allVariableValuesFound) {
      const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
      const jsonVariableValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selectionReferencingVariable);

      if (jsonVariableValue === undefined) {
        allVariableValuesFound = false;
        if (_.indexOf(metadata.variablesUndefined, jsonVariableName) === -1) {
          metadata.variablesUndefined.push(jsonVariableName);
        }
      }
      else {
        variableValues[templateVariableName] = jsonVariableValue;
      }
    }
  });

  if (allVariableValuesFound) {
    formulaValue = expr.evaluate(variableValues);
  }

  return {formulaValue, allVariableValuesFound};
};

// selectionReferencingVariable is optional
const sumSelections = (bidControllerData, selectionsToSum, valueFormula, selectionReferencingVariable) => {
  const {selections} = bidControllerData;
  if (!selectionsToSum) {
    return 0;
  }

  const add = (previousValue, selectionId) => {
    const selection = _.find(selections, (_selection) => _selection._id === selectionId);
    const {formulaValue, allVariableValuesFound} =
      calculateFormulaValue(bidControllerData, selection, valueFormula, selectionReferencingVariable);
    return previousValue + formulaValue;
  };

  return selectionsToSum.reduce(add, 0);
};

// This currently does not go through all descendents... only looks at descendents if templeType matches
// Intended to add all children of a particular type but needed to get descendents of children for area selections
const addDescendentSelectionsByTemplateType = (bidControllerData, descendentSelectionIds, selectionParent, templateType) => {
  if (selectionParent) {
    const childSelections = getChildSelections(selectionParent, bidControllerData);
    _.each(childSelections, (childSelection) => {
      const childSelectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, childSelection.templateId);
      if (childSelectionTemplate && childSelectionTemplate.templateType === templateType) {
        descendentSelectionIds.push(childSelection._id);
      } else {
        //Now add descendents of this child (but only for children with the requested templateType)
        addDescendentSelectionsByTemplateType(bidControllerData, descendentSelectionIds, childSelection, templateType);
      }
    });
  }
};

// This currently does not go through all descendents... only looks at descendents if templeType matches
const getDescendentSelectionIdsByTemplateType = (bidControllerData, selectionParent, templateType) => {
  if (selectionParent) {
    let descendentSelectionIds = [];
    addDescendentSelectionsByTemplateType(bidControllerData, descendentSelectionIds, selectionParent, templateType);
    return descendentSelectionIds;
  }

  return null;
};

const applyFunctionOverChildrenOfParent = (bidControllerData, selection) => {
  let returnValue = undefined;
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
  const applicableTemplateType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'ApplicableTemplateType');
  const parentSelection = SelectionsHelper.getParentSelections(selection, bidControllerData)[0];
  const descendentSelectionIds = getDescendentSelectionIdsByTemplateType(bidControllerData, parentSelection, applicableTemplateType);
  const functionName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, 'Function');
  const valueFormula = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, 'ValueFormula');

  if (functionName.toUpperCase() === 'SUM') {
    returnValue = sumSelections(bidControllerData, descendentSelectionIds, valueFormula, selection);
  }
  return returnValue;
};

const getDisplayValue = (bidControllerData, selection) => {
  if (selection) {
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
    if (selectionTemplate) {
      if (selectionTemplate.templateType === Constants.templateTypes.product) {
        return selectionTemplate.name;
      }
      return Filters.unitsFilter(selection.value, ItemTemplatesHelper.getUnitsText(selectionTemplate));
    }
    return selection.value;
  }
  return '';
};

const getPendingChangeMessagesByOriginalAndCurrentInfo = (originalValue, originalDisplayValue,
  originalValueSource, currentValue, currentDisplayValue, currentValueSource, isGettingInserted) => {
  let pendingChangeMessages = [];
  if (isGettingInserted) {
    pendingChangeMessages.push(`value initialization to ${currentDisplayValue}`);
  } else {
    if (originalValueSource !== currentValueSource) {
      pendingChangeMessages.push(`source change from ${originalValueSource} to ${currentValueSource}`);
    }
    if (originalValue !== currentValue) {
      pendingChangeMessages.push(`value change from ${originalDisplayValue} to ${currentDisplayValue}`);
    }
  }
  return pendingChangeMessages;
}

const getCustomValue = (bidControllerData, customLookup, selection, selectionTemplate) => {
  const {job, lookupData} = bidControllerData;
  let caseMaterialInteriorSku;
  let caseMaterialExposedSku;
  let returnValue = undefined;
  let jsonVariableName;
  let jsonVariableValue;

  if (customLookup === 'GetSheetMaterialCostPerArea') {
    // Change returnValue from undefined to null so that selection gets designated as the owner of its corresponding variable.
    returnValue = null;
    //CaseMaterialInteriorSku might be an actual SKU or a variable name containing a SKU
    caseMaterialInteriorSku = getSettingValue(selection, selectionTemplate, 'CaseMaterialInteriorSku');
    jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(caseMaterialInteriorSku);
    jsonVariableValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selection);
    if (jsonVariableValue !== undefined) {
      caseMaterialInteriorSku = jsonVariableValue;
    }

    caseMaterialExposedSku = getSettingValue(selection, selectionTemplate, 'CaseMaterialExposedSku');
    jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(caseMaterialExposedSku);
    jsonVariableValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selection);
    if (jsonVariableValue !== undefined) {
      caseMaterialExposedSku = jsonVariableValue;
    }

    const nominalThickness = getSettingValue(selection, selectionTemplate, 'NominalThickness');

    //Now need to look up the most appropriate sheet material offering
    const sheetMaterialData = lookupData && lookupData['sheetMaterialData'];

    //This should be something that can be set per job
    const pricingAt = job.pricingAt || new Date();

    // For now just get the first qualifying price
    if (sheetMaterialData) {
      _.each(sheetMaterialData, (sheetMaterial) => {
        if (sheetMaterial.coreMaterial && sheetMaterial.coreMaterial.sku === caseMaterialExposedSku) {
          _.each(sheetMaterial.sheetMaterialOfferings, (sheetMaterialOffering) => {
            if (sheetMaterialOffering.nominalThickness == nominalThickness) {
              sheetMaterialOffering.sheetMaterialPricings.forEach(function (sheetMaterialPricing) {
                if (sheetMaterialPricing.effectiveDate <= pricingAt
                    && sheetMaterialPricing.expirationDate >= pricingAt) {
                  //Want to return price per square foot
                  returnValue = sheetMaterialPricing.purchasePricePerSheet
                  / (sheetMaterialOffering.length / 12 * sheetMaterialOffering.width / 12);
                }
              });
            }
          });
        }
      });
    }
  }
  return returnValue;
}

const getSelectionValue = (bidControllerData, selection) => {
  const {metadata} = bidControllerData;
  if (!selection) {
    throw new Error('selection required in getSelectionValue');
  }
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
  let selectionValue;
  let selectionValueSource = selection.valueSource;
  const variableCollectorSelection = getVariableCollectorSelection(bidControllerData, selection);
  // variableCollectorSelection may not exist because it was deleted. Just return undefined in that case.
  if (!variableCollectorSelection) {
    return undefined;
  }
  let variableCollectorSelectionVariableSet = false;
  let valueFormula;
  let variableToDisplay;
  let defaultValue;
  let selectionJsonVariableName;
  let customLookup;
  let lookupType;
  // const propertyToOverride = getSettingValue(selection, selectionTemplate, Constants.templateSettingKeys.propertyToOverride);

  if (selectionTemplate) {
    selectionJsonVariableName = ItemTemplatesHelper.getJsonVariableName(selectionTemplate);
    if (selectionTemplate.templateType === Constants.templateTypes.lookupData) {
      //Just store the template id of the variable collector selection to help find it later
      selectionValue = variableCollectorSelection.templateId; // was template.name
      selectionValueSource = Constants.valueSources.lookupData;
    }
    else if (selectionTemplate.templateType === Constants.templateTypes.function) {
      selectionValue = applyFunctionOverChildrenOfParent(bidControllerData, selection);
      selectionValueSource = Constants.valueSources.calculatedValue;
    }
    //Check for a custom lookup
    else if (customLookup = getSettingValue(selection, selectionTemplate, Constants.templateSettingKeys.customLookup)) {
      selectionValue = getCustomValue(bidControllerData, customLookup, selection, selectionTemplate);
      selectionValueSource = Constants.valueSources.lookup;
    }
    //Check for valueFormula, which evaluates based on variables.
    else if (valueFormula = getSettingValue(selection,
      selectionTemplate, Constants.templateSettingKeys.valueFormula)) {
      const {formulaValue, allVariableValuesFound} = calculateFormulaValue(bidControllerData, selection, valueFormula, selection);
      if (allVariableValuesFound) {
        selectionValue = formulaValue;
        selectionValueSource = Constants.valueSources.calculatedValue;
      }
    }
    //If no ValueFormula, check for VariableToDisplay.
    else if (variableToDisplay = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
        selectionTemplate, Constants.templateSettingKeys.variableToDisplay)) {
      const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(selectionTemplate.variableToDisplay);
      selectionValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selection);
      selectionValueSource = Constants.valueSources.calculatedValue;
    }
    //If no VariableToDisplay, check for defaultValue as long as not isOverridingDefault.
    else if ((defaultValue = getSettingValue(selection, selectionTemplate,
          Constants.templateSettingKeys.defaultValue)) !== null
          && !selection.isOverridingDefault) {
      selectionValue = defaultValue;
      selectionValueSource = Constants.valueSources.defaultValue;
    }
    //If no ValueFormula and no default value (or isOverridingDefault), check for Value.
    else if (selection.value !== null && selection.value !== undefined) {
      selectionValue = selection.value;
      selectionValueSource = Constants.valueSources.userEntry;
    }

    metadata.variables[variableCollectorSelection._id] = metadata.variables[variableCollectorSelection._id] || {};
    //If VariableName exists, store value in it.
    if (selectionJsonVariableName &&
        metadata.variables[variableCollectorSelection._id] &&
        metadata.variables[variableCollectorSelection._id][selectionJsonVariableName] !== selectionValue) {
      metadata.variables[variableCollectorSelection._id][selectionJsonVariableName] = selectionValue;
      variableCollectorSelectionVariableSet = true;
    }
  }
  else {
    selectionValue = selection.value;
    selectionValueSource = Constants.valueSources.userEntry;
  }

  const originalValueSource = selectionValueSource;
  if (selection.valueSource !== selectionValueSource) {
    selection.valueSource = selectionValueSource;
  }

  storeSelectionValueAndUpdatePendingChanges(bidControllerData, selection,
    selectionValue, selection.value, variableCollectorSelection, variableCollectorSelectionVariableSet,
    originalValueSource, selectionValueSource, selectionJsonVariableName);
  return selectionValue;
};

const initializeValueToUse = (bidControllerData, selection) => {
  if (!selection) {
    return;
  }

  const childSelections = getChildSelections(selection, bidControllerData);
  _.each(childSelections, (childSelection) => {
    initializeValueToUse(bidControllerData, childSelection);
  });

  //Calling getSelectionValue() causes checks for undefined variables.
  getSelectionValue(bidControllerData, selection);
};

const initializePendingSelectionChanges = (metadata) => {
  metadata.pendingSelectionChanges = {};
}

const initializeMetadata = (metadata, leaveSelectionIdsToBeInserted) => {
  // columnSelectionIds should be like
  // {
  //   wHHJKRr2MhLdc4GkT: // productSelectionId
  //   [
  //     'jbexwHHJKRr2MhLdc', ... // id of column selection
  //   ]
  // }
  metadata.columnSelectionIds = {};

  // selectionIdsReferencingVariables should be like
  // {
  //   wHHJKRr2MhLdc4GkT: // id of variableCollector selection
  //   [
  //     {
  //       jsonVariableName: 'varpriceeach',
  //       selectionIds:
  //       [
  //         'jbexwHHJKRr2MhLdc', ... // id of selection referencing varpriceeach for the variableCollector selection
  //       ]
  //     }, ...
  //   ], ...
  // }
  metadata.selectionIdsReferencingVariables = {};

  // variablesUndefined should be like
  // [
  //   'varpriceeach', // jsonVariableName
  //   'varheight', ...// jsonVariableName
  // ]
  metadata.variablesUndefined = [];

  // variables should be like
  // {
  //   wHHJKRr2MhLdc4GkT: // id of variableCollector selection
  //   {
  //     varpriceeach: // jsonVariableName
  //       '99.99',    // variable value
  //     varheight:    // jsonVariableName
  //       '16.5', ... // variable value
  //   }
  // }
  metadata.variables = {};

  // pendingSelectionChanges should be like
  // {
  //   wHHJKRr2MhLdc4GkT: // id of selection with pending change
  //   {
  //     originalValue: '11.11',
  //     originalDisplayValue: '$11.11',
  //     originalValueSource: 'defaultValue',
  //     displayMessages: [
  //       'source change from undefined to defaultValue',
  //       'value change from $11.11 to $22.22',
  //     ], ...
  //   }
  // }
  // Sometimes a variable will make multiple transitions, like from 55 to 0 to 55. We store originalValue
  // so that we can identify pending changes that are not really changes.
  // Cannot just remove the key or the originalValue or originalValueSource could be wrong.
  metadata.pendingSelectionChanges = {};

  // selectOptions should be like
  // {
  //   wHHJKRr2MhLdc4GkT: // id of template with select options
  //   [
  //     {
  //       id: 'wHHJKRr2MhLdc4GkT': // id of template representing select option
  //       name: 'Lazy Susan Cabinet',
  //     }
  //   ]
  // }
  metadata.selectOptions = {};

  // selectionIdsToBeInserted should be like
  //   [
  //     'wHHJKRr2MhLdc4GkT', // id of selection being inserted
  //     '23kmEd92MhLdc4ww6', // id of selection being inserted
  //   ]
  if (!leaveSelectionIdsToBeInserted) {
    metadata.selectionIdsToBeInserted = [];
  }

  // tabPages should be like
  //   [
  //     {
  //       name: 'All',
  //       templateIds: [
  //         '23kmEd92MhLdc4ww6', // id of template
  //         'wHHJKRr2MhLdc4GkT', // id of template
  //       ]
  //     },
  //     {
  //       name: 'Hardware',
  //       templateIds: [
  //         '23kmEd92MhLdc4ww6', // id of template
  //       ]
  //     },
  //   ]
  metadata.tabPages = [];
};

const getInitializedMetadata = () => {
  let metadata = {};
  initializeMetadata(metadata);
  return metadata;
};

const initializeSelectionVariables = (bidControllerData) => {
  const {metadata} = bidControllerData;
  // start with the topmost selection, which should be the company selection
  const companyTemplate = TemplateLibrariesHelper.getTemplateByType(bidControllerData, Constants.templateTypes.company);
  if (!companyTemplate) {
    return;
  }

  const companySelection = getSelectionByTemplate(bidControllerData, companyTemplate);
  if (!companySelection) {
    return;
  }

  createSelectionVariables(bidControllerData, companySelection);

  initializeValueToUse(bidControllerData, companySelection);

  //If any dependent variables are undefined, then something must be wrong.
  if (metadata.variablesUndefined.length > 0) {
    console.log('Variables not defined:' + metadata.variablesUndefined.join(","));
      // throw new Error('Variables not defined:' + metadata.variablesUndefined.join(","));
  }
};

const getDisplayDescription = (bidControllerData, selection) => {
  if (selection) {
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
    if (selectionTemplate) {
      const templateVariableName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, 'VariableName');
      if (templateVariableName) {
        const parentSelection = SelectionsHelper.getParentSelections(selection, bidControllerData)[0];
        if (parentSelection) {
          const parentSelectionDisplayDescription = getDisplayDescription(bidControllerData, parentSelection);
          return `${parentSelectionDisplayDescription} ${templateVariableName}`;
        }
        return templateVariableName;
      }
      return selectionTemplate.name;
    }
    return selection.value;
  }
  return '';
}

const getPendingChangeMessages = (bidControllerData) => {
  const {metadata, selections} = bidControllerData;
  return _.reduce(
    metadata.pendingSelectionChanges,
    (pendingChangeMessages, pendingChangeMessagesWithoutSelectionDescription, selectionId) => {
      const selection = _.find(selections, (selection) => selection._id === selectionId);
      const selectionDisplayDescription = getDisplayDescription(bidControllerData, selection);
      let newPendingChangeMessages = [];
      _.each(pendingChangeMessagesWithoutSelectionDescription.displayMessages, (pendingChangeMessageWithoutSelectionDescription) => {
        const newPendingChangeMessage = selectionDisplayDescription + ' ' + pendingChangeMessageWithoutSelectionDescription;
        if (pendingChangeMessages.indexOf(newPendingChangeMessage) === -1) {
          newPendingChangeMessages.push(newPendingChangeMessage);
        }
      });
      return [...pendingChangeMessages, ...newPendingChangeMessages];
    },
    []);
}

const storeSelectionValueAndUpdatePendingChanges = (bidControllerData, selection,
  selectionValue, oldValue, variableCollectorSelection, variableCollectorSelectionVariableSet,
  originalValueSource, selectionValueSource, selectionJsonVariableName) => {
  const {metadata} = bidControllerData;
  const originalValue = oldValue;
  const originalDisplayValue = getDisplayValue(bidControllerData, selection);
  if (selectionValue !== undefined
      && selectionValue !== null &&
      (variableCollectorSelectionVariableSet || oldValue !== selectionValue.toString())) {
    if (oldValue !== selectionValue.toString()) {
      selection.value = selectionValue.toString();
      // afterSettingValue(selection);
    }

    // Make sure formulas that reference this selection's variable get updated
    if (selectionJsonVariableName && variableCollectorSelection) {
      refreshSelectionsReferencingVariable(bidControllerData, variableCollectorSelection, selectionJsonVariableName);
    }
  }

  const isGettingInserted = _.contains(metadata.selectionIdsToBeInserted, selection._id);
  const currentDisplayValue = getDisplayValue(bidControllerData, selection);
  let displayMessages = getPendingChangeMessagesByOriginalAndCurrentInfo(originalValue, originalDisplayValue,
    originalValueSource, selection.value, currentDisplayValue, selectionValueSource, isGettingInserted);
  if (displayMessages.length > 0) {
    if (!metadata.pendingSelectionChanges[selection._id]) {
      metadata.pendingSelectionChanges[selection._id] = {
        originalValue,
        originalDisplayValue,
        originalValueSource,
        displayMessages
      };
    } else {
      // Get displayMessages using the truly original values (current original ones represent altered values).
      displayMessages = getPendingChangeMessagesByOriginalAndCurrentInfo(
        metadata.pendingSelectionChanges[selection._id].originalValue,
        metadata.pendingSelectionChanges[selection._id].originalDisplayValue,
        metadata.pendingSelectionChanges[selection._id].originalValueSource,
        selection.value, currentDisplayValue, selectionValueSource, isGettingInserted);
      metadata.pendingSelectionChanges[selection._id].displayMessages = displayMessages;
    }
  }
}

const setSelectionValue = (bidControllerData, selection, selectionValue, oldValue, originalValueSource, selectionValueSource) => {
  const {metadata} = bidControllerData;
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selection.templateId);
  let variableCollectorSelection;
  let variableCollectorSelectionVariableSet = false;
  let jsonVariableName;

  if (selectionValue !== null && selectionValue !== undefined) {
    selectionValue = selectionValue.toString();
  }

  if (oldValue !== selectionValue) {
    //This may not be right. May need another mechanism to determine isOverridingDefault.
    const defaultValue = getSettingValue(selection, selectionTemplate, Constants.templateSettingKeys.defaultValue)
    if (defaultValue !== selectionValue) {
      selection.isOverridingDefault = true;
    }
    // afterSettingValue(self);
  }

  if (selectionTemplate) {
    variableCollectorSelection = getVariableCollectorSelection(bidControllerData, selection);
    jsonVariableName = ItemTemplatesHelper.getJsonVariableName(selectionTemplate);

    if (jsonVariableName && variableCollectorSelection
      && metadata.variables
      && metadata.variables[variableCollectorSelection._id]
      && metadata.variables[variableCollectorSelection._id][jsonVariableName] !== selectionValue) {
      metadata.variables[variableCollectorSelection._id][jsonVariableName] = selectionValue;

      variableCollectorSelectionVariableSet = true;
      // refreshSelectionsReferencingVariable(bidControllerData, variableCollectorSelection, jsonVariableName);
    }
  }

  if (oldValue !== selectionValue || variableCollectorSelectionVariableSet) {
    storeSelectionValueAndUpdatePendingChanges(bidControllerData, selection, selectionValue,
      oldValue, variableCollectorSelection, variableCollectorSelectionVariableSet,
      originalValueSource, selectionValueSource, jsonVariableName);
  }
}

const getVariableCollectorSelectionWithVariableValue = (bidControllerData, selection, jsonVariableName) => {
  const {metadata} = bidControllerData;
  if (!selection) {
    return null;
  }
  const variableCollectorSelection = getVariableCollectorSelection(bidControllerData, selection);
  if (jsonVariableName && variableCollectorSelection
      && metadata.variables
      && metadata.variables[variableCollectorSelection._id]
      && metadata.variables[variableCollectorSelection._id][jsonVariableName] !== undefined) {
    return variableCollectorSelection;
  }
  const parentSelection = SelectionsHelper.getParentSelections(variableCollectorSelection, bidControllerData)[0];
  return getVariableCollectorSelectionWithVariableValue(bidControllerData, parentSelection, jsonVariableName);
}

const isCandidateSelectionAnAncestor = (bidControllerData, selection, candidateSelection) => {
  if (!selection || !candidateSelection) {
    return false;
  }
  if (selection._id === candidateSelection._id) {
    return true;
  }
  const parentSelection = SelectionsHelper.getParentSelections(selection, bidControllerData)[0];
  return isCandidateSelectionAnAncestor(bidControllerData, parentSelection, candidateSelection);
}

// If there is a variable associated with this template, a different selection up the hierarchy is
// probably its variableCollectorSelection, so we need to find all of the
// selectionIdsReferencingVariables and move some of them to the new variableCollectorSelection.
// Essentially we need to move the ones that have the new variableCollectorSelection as an ancestor.
const moveVariableReferencesToNewVariableCollectorSelection = (bidControllerData, template, selection) => {
  const {metadata, selections} = bidControllerData;
  const jsonVariableName = ItemTemplatesHelper.getJsonVariableName(template);
  const oldVariableCollectorSelection = getVariableCollectorSelectionWithVariableValue(bidControllerData, selection, jsonVariableName);
  const newVariableCollectorSelection = getVariableCollectorSelection(bidControllerData, selection);

  if (oldVariableCollectorSelection && newVariableCollectorSelection &&
      metadata.selectionIdsReferencingVariables[oldVariableCollectorSelection._id]) {
    const oldSelectionIdsReferencingVariable = _.find(metadata.selectionIdsReferencingVariables[oldVariableCollectorSelection._id],
      (selectionIdsReferencingVariable) => {
        return (selectionIdsReferencingVariable.jsonVariableName === jsonVariableName);
    });
    metadata.selectionIdsReferencingVariables[newVariableCollectorSelection._id] =
      metadata.selectionIdsReferencingVariables[newVariableCollectorSelection._id] || [];
    let newSelectionIdsReferencingVariable = _.find(metadata.selectionIdsReferencingVariables[newVariableCollectorSelection._id],
      (selectionIdsReferencingVariable) => {
        return (selectionIdsReferencingVariable.jsonVariableName === jsonVariableName);
    });
    if (oldSelectionIdsReferencingVariable) {
      if (!newSelectionIdsReferencingVariable) {
        newSelectionIdsReferencingVariable = {
          jsonVariableName,
          selectionIds: []
        };
        metadata.selectionIdsReferencingVariables[newVariableCollectorSelection._id].push(newSelectionIdsReferencingVariable);
      }
      // Remove selectionsReferencingVariable from oldVariableCollectorSelection and add to newVariableCollectorSelection
      // for jsonVariableName if newVariableCollectorSelection is an ancestor of selectionReferencingVariable.
      for (let oldIndex = oldSelectionIdsReferencingVariable.selectionIds.length - 1; oldIndex >= 0; oldIndex--) {
        const selectionReferencingVariableId = oldSelectionIdsReferencingVariable.selectionIds[oldIndex];
        const selectionReferencingVariable = _.find(selections, (_selection) => _selection._id === selectionReferencingVariableId);
        if (selectionReferencingVariable &&
            isCandidateSelectionAnAncestor(bidControllerData, selectionReferencingVariable, newVariableCollectorSelection)) {
          oldSelectionIdsReferencingVariable.selectionIds.splice(oldIndex, 1);
          newSelectionIdsReferencingVariable.selectionIds.push(selectionReferencingVariableId);
        }
      };
    }
  }
}

// See also jobs method version of addSelectionForTemplate
const addSelectionForTemplate = (bidControllerData, template, selectionValue, parentSelectionId, childOrder) => {
  const {job, metadata, selections, selectionRelationships, templateLibraries} = bidControllerData;
  const templateLibrary = TemplateLibrariesHelper.getTemplateLibraryWithTemplate(bidControllerData, template.id);
  // check(templateLibrary, Match.Any);// Schema.TemplateLibrary);
  // check(selections, Match.Any);// Match.OneOf([Schema.Selection], null));
  // check(selectionRelationships, Match.Any);// Match.OneOf([Schema.SelectionRelationship], null));
  // check(jobId, Match.Any);// String);
  // check(template, Match.Any);// Schema.ItemTemplate);
  // check(selectionValue, Match.Any);// Match.OneOf(String, null));
  // check(parentSelectionId, Match.Any);// Schema.Selection);
  // check(childOrder, Match.Any);// Match.OneOf(Number, null));
  let selection = {
    isOverridingDefault: false,
    jobId: job._id,
    templateLibraryId: templateLibrary._id,
    templateId: template.id,
    value: selectionValue || ''
  };

  const selectionId = Random.id(); // this is temporary, can be changed when actually inserted into Selections collection
  selection._id = selectionId;
  selections.push(selection);
  if (metadata.selectionIdsToBeInserted) {
    metadata.selectionIdsToBeInserted.push(selection._id);
  }

  if (parentSelectionId) {
    let selectionRelationship = {
      jobId: job._id,
      parentSelectionId: parentSelectionId,
      childSelectionId: selectionId,
      order: childOrder
    }
    selectionRelationship._id = Random.id();
    selectionRelationships.push(selectionRelationship);
  }

  // ToDo: add selection settings?

  // If there is a variable associated with this template, a different selection up the hierarchy is
  // probably its variableCollectorSelection, so we need to find all of the
  // selectionIdsReferencingVariables and move some of them to the new variableCollectorSelection.
  // Essentially we need to move the ones that have the new variableCollectorSelection as an ancestor.
  moveVariableReferencesToNewVariableCollectorSelection(bidControllerData, template, selection);

  // Call getSelectionValue to update relevant metadata (or maybe instead setSelectionValue)
  setSelectionValue(bidControllerData, selection, selection.value, null,
    Constants.valueSources.nothing, Constants.valueSources.userEntry);
  // getSelectionValue(templateLibrary, selections, selectionRelationships, metadata, lookupData, selection);

  return selection;
};

const addOrUpdateSelectionSettings = (selection, selectionSettingsToAddOrUpdate) => {
  let newSelectionSettings = selection.selectionSettings || [];
  if (selectionSettingsToAddOrUpdate) {
    _.each(selectionSettingsToAddOrUpdate, (selectionSettingToAddOrUpdate) => {
      let existingSelectionSetting = _.find(newSelectionSettings, (selectionSetting) => {
        return selectionSetting.key === selectionSettingToAddOrUpdate.key;
      });

      if (existingSelectionSetting) {
        if (selectionSettingsToAddOrUpdate.levelFromHere >= existingSelectionSetting.levelFromHere) {
          existingSelectionSetting.value = selectionSettingToAddOrUpdate.value;
        }
      } else {
        newSelectionSettings.push(selectionSettingToAddOrUpdate);
      }
    });
  }
  selection.selectionSettings = newSelectionSettings;
}

// given stringMaybeWithVariableBindings like 'hinge{hardwareMaterial}{lengthInInches}'
// should result in templateVariableNames = ['hardwareMaterial', 'lengthInInches']
const populateTemplateVariables = (templateVariableNames, stringMaybeWithVariableBindings, fromIndex) => {
  const indexOfLeftBrace = stringMaybeWithVariableBindings.indexOf('{', fromIndex);
  if (indexOfLeftBrace > 0) {
    const indexOfRightBrace = stringMaybeWithVariableBindings.indexOf('}', indexOfLeftBrace + 1);
    if (indexOfRightBrace > 0) {
      const templateVariableName = stringMaybeWithVariableBindings.substring(indexOfLeftBrace + 1, indexOfRightBrace);
      templateVariableNames.push(templateVariableName);
      populateTemplateVariables(templateVariableNames, stringMaybeWithVariableBindings.replace(`{${templateVariableName}}`, ''), indexOfLeftBrace)
    }
  }
};

// stringMaybeWithVariableBindings expected to be like 'hinge{hardwareMaterial}{lengthInInches}'
// where hardwareMaterial and lengthInInches are template variable names
const replaceVariablesWithValues = (bidControllerData, selection, stringMaybeWithVariableBindings) => {
  let returnString = stringMaybeWithVariableBindings;
  const templateVariableNames = [];
  populateTemplateVariables(templateVariableNames, stringMaybeWithVariableBindings, 0);
  _.each(templateVariableNames, (templateVariableName) => {
    const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
    const jsonVariableValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selection);
    returnString = returnString.replace(`{${templateVariableName}}`, jsonVariableValue);
  });
  return returnString;
};

const addSelectionsForChildTemplateRelationship = (bidControllerData, selection, template,
    selectionAddingMode, templateRelationship, templateToStopAt) => {
  const childTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, templateRelationship.childTemplateId);
  if (!childTemplate) {
    return;
  }
  const isABaseTemplate = ItemTemplatesHelper.isABaseTemplate(childTemplate);
  const isASubTemplate = ItemTemplatesHelper.isASubTemplate(childTemplate);

  if (selectionAddingMode === Constants.selectionAddingModes.handleAnything
      ||
      (!isABaseTemplate && selectionAddingMode === Constants.selectionAddingModes.ignoreBaseTemplates)
      ||
      (isASubTemplate && selectionAddingMode === Constants.selectionAddingModes.onlySubTemplates)
      ||
      (!isASubTemplate && selectionAddingMode === Constants.selectionAddingModes.ignoreSubTemplates)) {
    const isVariableOverride = childTemplate.templateSettings
        && _.find(childTemplate.templateSettings, (templateSetting) => {
          return templateSetting.key === Constants.templateSettingKeys.isVariableOverride && templateSetting.value === true.toString();
        });
    if (childTemplate.templateType !== Constants.templateTypes.productSelection) {
      if (templateToStopAt && childTemplate.templateType === templateToStopAt.templateType) {
        //Do nothing except establish relationship because child represents the master selection that has already been created.
        //Moved to addSelectionsForTemplateChildren
        //createSelectionRelationship({
        //    parentSelection: selection,
        //    childSelection: masterSelection,
        //    order: 0 //template.order(),
        //});
      } else if (isVariableOverride) {
        //Don't add a selection if this is a variable override (Because the selection for the template containing the variable is added separately)
        //But add the appropriate override selection setting to that selection
        let variableToOverride = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.variableToOverride);
        let propertyToOverride = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.propertyToOverride);
        let overrideValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.overrideValue);
        let jsonVariableName; // gets set if overrideValue determined by lookup
        if (!overrideValue) {
          const lookupType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.lookupType);
          const lookupKeyVariable = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.lookupKeyVariable);
          const lookupKeyVariableReplaced = replaceVariablesWithValues(bidControllerData, selection, lookupKeyVariable);
          overrideValue = `getLookup${lookupType}(${lookupKeyVariableReplaced})`;
        }
        let overrideType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.overrideType);
        const {selectionToOverride, levelFromHere} =
          getSelectionToOverrideOrAddIfAppropriate(bidControllerData, selection, variableToOverride, [], overrideValue, childTemplate);
        if (selectionToOverride) {
          // if overrideType is fromSpecificationGroup  and selectionToOverride's overrideType is fromSpecificationGroup, just update the selection
          const overrideTemplateId = getSelectionSettingValueForSelection(selectionToOverride, Constants.selectionSettingKeys.overrideTemplateId);
          const overrideTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, overrideTemplateId);
          let selectionToOverrideOverrideType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(overrideTemplate, Constants.templateSettingKeys.overrideType);
          if (overrideType === Constants.overrideTypes.fromSpecificationGroup && selectionToOverrideOverrideType === Constants.overrideTypes.fromSpecificationGroup) {
            setSelectionValue(bidControllerData, selectionToOverride, overrideValue,
                selectionToOverride.value, selectionToOverride.valueSource, Constants.valueSources.defaultValue);
          } else {
            addOrUpdateSelectionSettings(selectionToOverride, [ { key: propertyToOverride, value: overrideValue, levelFromHere, overrideType } ]);
          }
        }
      } else if (isASubTemplate) {
        //Don't do anything. Sub templates are now handled in ProductSelection case.
      } else if (isABaseTemplate) {
        //If template IsABaseTemplate then don't add selection for this template now, just add selections for all of
        //its child sub templates (and they will add this template's other children).
        addSelectionsForTemplateChildren(bidControllerData, selection, childTemplate,
          Constants.selectionAddingModes.onlySubTemplates, templateToStopAt);
      } else {
        // SelectionsHelper.getSelectionValue(templateLibraries[0], selections, selectionRelationships, metadata, selection) => {
        const defaultValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.defaultValue);

        //Not a base template or a sub template, so no matter the adding mode should go back to handling everything
        addSelectionsForTemplateAndChildren(bidControllerData, childTemplate,
          defaultValue, selection, 0, Constants.selectionAddingModes.handleAnything, templateToStopAt);
      }
    }
  }
};

const isTemplateConditionMet = (bidControllerData, selection, template) => {
  const conditionType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.conditionType);
  switch (conditionType) {
    case Constants.conditionTypes.switch:
      const switchVariable = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.switchVariable);
      const switchValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.switchValue);
      const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(switchVariable);
      const jsonVariableValue = getJsonVariableValue(bidControllerData, selection, jsonVariableName, selection);
      return jsonVariableValue == switchValue;
    default:
      return false;
  }
}

const addSelectionsForTemplateChildren = (bidControllerData, selection, template,
    selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt) => {
  if (selection && template)
  {
    if (template.templateType === Constants.templateTypes.condition &&
      !isTemplateConditionMet(bidControllerData, selection, template)) {
      return;
    }

    //Add selections for template children that are not SubItems (sub templates) first so that everything that might be overridden by sub template exists.
    // But don't add selections for optionalOverride or optionalExplicit template children at all
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(bidControllerData, template.id))
      .filter((templateRelationship) => {
        return templateRelationship.relationToItem != Constants.relationToItem.subItem &&
          templateRelationship.dependency !== Constants.dependency.optionalOverride &&
          templateRelationship.dependency !== Constants.dependency.optionalExplicit;
      })
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(bidControllerData, selection, template,
          selectionAddingMode, templateRelationship, templateToStopAt);
      });

    //Now it's safe to add selections for template children that are SubItems.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(bidControllerData, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem == Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(bidControllerData, selection, template,
          selectionAddingMode, templateRelationship, templateToStopAt);
      });

    //Handle case where this is a sub template but also a parent of a sub template. So need to add the template children of the base template
    if (selectionAddingMode == Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates) {
      let isABaseTemplate = template.templateSettings
        && _.find(template.templateSettings, (templateSetting) => {
          return templateSetting.key === "IsABaseTemplate" && templateSetting.value === true.toString();
        });

      //To get here must be a sub template or base template, so go ahead and add selections for children
      addSelectionsForTemplateChildren(bidControllerData, selection, template,
        Constants.selectionAddingModes.ignoreSubTemplates, templateToStopAt);

      //If this template is not a base template then still need to add selections for children of parent template(s)
      if (!isABaseTemplate)
      {
        _.each(TemplateLibrariesHelper.getTemplateParents(bidControllerData, template), (parentTemplate) => {
          addSelectionsForTemplateChildren(bidControllerData, selection, parentTemplate,
            Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates, templateToStopAt);
        });
      }
    }
  }
};

const addSelectionsForTemplateAndChildren = (bidControllerData, template, selectionValue, parentSelection, childOrder,
      selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt) => {
  if (template.templateType === Constants.templateTypes.condition &&
    !isTemplateConditionMet(bidControllerData, parentSelection, template)) {
    return null;
  }

  let selection = addSelectionForTemplate(bidControllerData, template, selectionValue, parentSelection._id, childOrder);
  addSelectionsForTemplateChildren(bidControllerData, selection, template, selectionAddingMode, templateToStopAt);

  return selection;
};

const addSelectionChildrenOfProduct = (bidControllerData, subTemplateSelection, productTemplate) => {
  //Add the template children of the base template before the sub template children because they override some of these
  const parentTemplate =  TemplateLibrariesHelper.getTemplateParent(bidControllerData, productTemplate);
  const isABaseTemplate = ItemTemplatesHelper.isABaseTemplate(parentTemplate);
  const isASubTemplate = ItemTemplatesHelper.isASubTemplate(parentTemplate);
  if (!isABaseTemplate && !isASubTemplate) {
    return;
  }

  addSelectionChildrenOfProduct(bidControllerData, subTemplateSelection, parentTemplate);

  addSelectionsForTemplateChildren(bidControllerData, subTemplateSelection,
      parentTemplate, Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates, null);

  //Add selection and template children for productTemplate (sub template)
  const subTemplateSelectionTemplate =  TemplateLibrariesHelper.getTemplateById(bidControllerData, subTemplateSelection.templateId);
  addSelectionsForTemplateChildren(bidControllerData, subTemplateSelection,
      subTemplateSelectionTemplate, Constants.selectionAddingModes.ignoreSubTemplates, null);
};

const addProductSelectionAndChildren = (bidControllerData, parentSelection, productSelectionTemplate, productTemplate, childOrder) => {
  check();
  check(bidControllerData, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    lookupData: Match.Any,
    metadata: Match.Any,
    job: Schema.Job,
    templateLibraries: [Schema.TemplateLibrary],
  });
  check(parentSelection, Schema.Selection);
  check(productSelectionTemplate, Schema.ItemTemplate);
  check(productTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  //Add selection for productSelectionTemplate
  var productSelection = addSelectionsForTemplateAndChildren(bidControllerData, productSelectionTemplate,
    null, parentSelection, childOrder, Constants.selectionAddingModes.ignoreBaseTemplates, null);

  //Add selection for productTemplate (sub template) (will add template children for sub template after adding template children of base template)
  var subTemplateSelection = addSelectionForTemplate(bidControllerData, productTemplate,
    productTemplate.id, productSelection._id, 0);

  addSelectionChildrenOfProduct(bidControllerData, subTemplateSelection, productTemplate);

  initializeSelectionVariables(bidControllerData);
  // ToDo: Make this (call to initializeSelectionVariables) faster by doing something like the commented (only update the necessary selections)
  // createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, productSelection);
  // initializeValueToUse(bidControllerData, productSelection);
  // //If any dependent variables are undefined, then something must be wrong.
  // if (metadata.variablesUndefined.length > 0) {
  //     throw new Error('Variables not defined:' + variablesUndefined.join(","));
  // }
  // // Make sure formulas that reference new productSelection variables get updated.  NOT SURE HOW TO DO THIS!!!!!!
  // refreshValueToUse(templateLibraries, selections, selectionRelationships, metadata, parentSelection);
  // refreshValueToUse(templateLibraries, selections, selectionRelationships, metadata, productSelection);
  // _.each(selectionRefreshesNeeded, (selectionInfo) => {
  //   const {variableCollectorSelection, selectionJsonVariableName} = selectionInfo;
  //   if (selectionJsonVariableName && variableCollectorSelection) {
  //     refreshSelectionsReferencingVariable(bidControllerData, variableCollectorSelection, selectionJsonVariableName);
  //   }
  // });

  return productSelection;
};

const addSpecificationGroupSelectionAndChildren = (bidControllerData, parentSelection,
  specificationGroupTemplate, selectionValue, childOrder) => {
  check(bidControllerData, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    lookupData: Match.Any,
    metadata: Match.Any,
    job: Schema.Job,
    templateLibraries: [Schema.TemplateLibrary],
  });
  check(parentSelection, Schema.Selection);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  var specificationGroupSelection = addSelectionsForTemplateAndChildren(bidControllerData,
    specificationGroupTemplate, selectionValue, parentSelection, childOrder,
    Constants.selectionAddingModes.handleAnything, null);

  initializeSelectionVariables(bidControllerData);
  // createSelectionVariables(bidControllerData, specificationGroupSelection);
  // initializeValueToUse(bidControllerData, specificationGroupSelection);

  return specificationGroupSelection;
};

const updateSpecificationGroupSelectionAndChildren = (bidControllerData,
  specificationGroupSelection, specificationGroupTemplate, selectionValue, childOrder) => {
  check(bidControllerData, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    lookupData: Match.Any,
    metadata: Match.Any,
    job: Schema.Job,
    templateLibraries: [Schema.TemplateLibrary],
  });
  check(specificationGroupSelection, Schema.Selection);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  setSelectionValue(bidControllerData, specificationGroupSelection, selectionValue,
      specificationGroupSelection.value, specificationGroupSelection.valueSource, Constants.valueSources.override);

  deleteSelectionChildren(bidControllerData, specificationGroupSelection);

  addSelectionsForTemplateChildren(bidControllerData, specificationGroupSelection,
    specificationGroupTemplate, Constants.selectionAddingModes.handleAnything, null);

  initializeSelectionVariables(bidControllerData);
  // createSelectionVariables(bidControllerData, specificationGroupSelection);
  // initializeValueToUse(bidControllerData, specificationGroupSelection);

  return specificationGroupSelection;
};

// Actually deletes selection, parent selection relationships (but not parent selection), child selection relationships,
// and all descendent selections (children, grandchildren, etc.)
const deleteSelectionAndRelated = (bidControllerData, selectionToDelete) => {
  check(bidControllerData, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    lookupData: Match.Any,
    metadata: Match.Any,
    job: Schema.Job,
    templateLibraries: [Schema.TemplateLibrary],
  });
  check(selectionToDelete, Schema.Selection);
  const {metadata, selections, selectionRelationships, templateLibraries} = bidControllerData;
  const addSelectionAndRelationshipIdsOfDescendents = (selectionToDelete, selectionsToDelete, selectionRelationshipIds) => {
    selectionsToDelete.push(selectionToDelete);
    const childRelationships = _.filter(selectionRelationships,
      (relationship) => relationship.parentSelectionId === selectionToDelete._id);
    _.each(childRelationships, (relationship) => {
      selectionRelationshipIdsToDelete.push(relationship._id);
      const childSelection = _.find(selections, (selection) => selection._id === relationship.childSelectionId);
      if (childSelection) {
        addSelectionAndRelationshipIdsOfDescendents(childSelection, selectionsToDelete, selectionRelationshipIds);
      }
    });
  };
  let selectionsToDelete = [];
  let selectionRelationshipIdsToDelete = [];

  // First get the parent relationships to delete
  const parentRelationshipIds = _.chain(selectionRelationships)
      .filter((relationship) => relationship.childSelectionId === selectionToDelete._id)
      .map((relationship) => relationship._id)
      .value();
  selectionRelationshipIdsToDelete.push(parentRelationshipIds);

  addSelectionAndRelationshipIdsOfDescendents(
    selectionToDelete,
    selectionsToDelete,
    selectionRelationshipIdsToDelete);

  const selectionRefreshesNeeded = [];
  _.each(selectionsToDelete, (selectionToDelete) => {
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(bidControllerData, selectionToDelete.templateId);
    const variableCollectorSelection = getVariableCollectorSelection(bidControllerData, selectionToDelete);
    const populateSelectionRefreshesNeeded = (selectionJsonVariableName) => {
      if (selectionJsonVariableName) {
        selectionRefreshesNeeded.push({variableCollectorSelection, selectionJsonVariableName});
      }
    }
    if (selectionTemplate) {
      populateSelectionRefreshesNeeded(ItemTemplatesHelper.getJsonVariableName(selectionTemplate));
      // a condition selection can impact variables determined by each of its children
      if (selectionTemplate.templateType === Constants.templateTypes.condition) {
        const templateChildren = TemplateLibrariesHelper.getTemplateChildren(bidControllerData, selectionTemplate);
        _.each(templateChildren, (templateChild) => {
          const templateVariableName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(templateChild, 'VariableToOverride');
          const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
          populateSelectionRefreshesNeeded(jsonVariableName);
        });
      }
    }
  })
  bidControllerData.selections = _.filter(selections, (selection) =>
    !_.any(selectionsToDelete, (selectionToDelete) => selectionToDelete._id === selection._id));
  bidControllerData.selectionRelationships = _.filter(selectionRelationships, (selectionRelationship) => !_.contains(selectionRelationshipIdsToDelete, selectionRelationship._id));

  // Remove deleted selections from metadata
  const selectionIdsToDelete = _.map(selectionsToDelete, (selectionToDelete) => selectionToDelete._id);
  metadata.selectionIdsReferencingVariables =
    _.omit(metadata.selectionIdsReferencingVariables, (value, key) => _.contains(selectionIdsToDelete, key));

  // Make sure formulas that reference deleted selection variables get updated
  _.each(selectionRefreshesNeeded, (selectionInfo) => {
    const {variableCollectorSelection, selectionJsonVariableName} = selectionInfo;
    if (selectionJsonVariableName && variableCollectorSelection) {
      refreshSelectionsReferencingVariable(bidControllerData, variableCollectorSelection, selectionJsonVariableName);
    }
  });
};

const deleteSelectionChildren = (bidControllerData, selection) => {
  const childSelections = getChildSelections(selection, bidControllerData);
  _.each(childSelections, (childSelection) => {
    deleteSelectionAndRelated(bidControllerData, childSelection);
  });
};

const getSpecificationListInfo = (bidControllerData, applicableSpecificationGroupTemplates, selection) => {
  let specifications = [];
  _.each(applicableSpecificationGroupTemplates, (template) => {
    const selectionItem = new InputSelectionItem(bidControllerData, template, selection._id);
    specifications.push({
      label: selectionItem.value,
      class: selectionItem.isDefinedAtThisLevel ? "label label-success" : "label label-default",
    });
  });
  return specifications;
};

SelectionsHelper = {
  addProductSelectionAndChildren,
  addSelectionForTemplate,
  addSelectionsForTemplateChildren,
  addSpecificationGroupSelectionAndChildren,
  applyFunctionOverChildrenOfParent,
  deleteSelectionAndRelated,
  deleteSelectionChildren,
  getChildSelections,
  getChildSelectionsWithTemplateId,
  getDisplayValue,
  getInitializedMetadata,
  getJsonVariableValue,
  getParentSelections,
  getPendingChangeMessages,
  getSelectionByTemplate,
  getSettingValue,
  getSelectionToOverride,
  getSelectionsBySelectionParentAndTemplate,
  getSelectionValue,
  getSpecificationListInfo,
  getVariableCollectorSelection,
  initializeMetadata,
  initializePendingSelectionChanges,
  initializeSelectionVariables,
  setSelectionValue,
  sumSelections,
  updateSpecificationGroupSelectionAndChildren,
}
