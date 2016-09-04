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

function getChildSelections(selection, selections, selectionRelationships) {
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

function getChildSelectionsWithTemplateId(selection, templateId, selections, selectionRelationships) {
  if (!selection) {
    throw 'selection must be set in getChildSelectionsWithTemplateId';
  }
  if (!templateId) {
    throw 'templateId must be set in getChildSelectionsWithTemplateId';
  }

  if (selections && selectionRelationships) {
    const childSelectionIds = _.chain(selectionRelationships)
        .filter((selectionRelationship) => selectionRelationship.parentSelectionId === selection._id)
        .map((selectionRelationship) => selectionRelationship.childSelectionId);
    return _.map(selections, (_selection) => _selection.templateId === templateId &&
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

function getChildSelectionsWithTemplateIds(selection, templateIds) {
  if (!selection) {
    throw 'selection must be set in getChildSelectionsWithTemplateIds';
  }
  if (!templateIds) {
    throw 'templateIds must be set in getChildSelectionsWithTemplateIds';
  }

  let childSelectionIds = SelectionRelationships.find({parentSelectionId: selection._id})
    .map(function(relationship){
      return relationship.childSelectionId;
    });
  return Selections.find(
    {
      _id: { $in: childSelectionIds },
      templateId: { $in: templateIds }
    }).fetch();
}

function getParentSelections(selection, selections, selectionRelationships) {
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
function getSelectionToOverrideOrAddIfAppropriate(templateLibrary, selection, variableToOverride,
  selectionIdsToIgnore, selections, selectionRelationships, selectionValue, lookupData, metadata, jobId, overrideTemplate) {
  let returnValue = getSelectionToOverride(templateLibrary, selection, variableToOverride,
    selectionIdsToIgnore, selections, selectionRelationships, 0);
  // If no selectionToOverride was found just give up.
  if (!returnValue || !returnValue.selectionToOverride) {
    return returnValue;
  }

  const expectedVariableCollectorSelection = getVariableCollectorSelection([templateLibrary],
    selections, selectionRelationships, selection);
  const selectionToOverrideVariableCollectorSelection = getVariableCollectorSelection([templateLibrary],
    selections, selectionRelationships, returnValue.selectionToOverride);
  if (expectedVariableCollectorSelection === selectionToOverrideVariableCollectorSelection) {
    return returnValue;
  }

  // selectionToOverride belongs to a different variableCollectorSelection, so create a new selection.
  // ToDo: ensure that newSelectionTemplate can be a child of expectedVariableCollectorSelection's template.
  const newSelectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary,
    returnValue.selectionToOverride.templateId);
  const newSelection = addSelectionsForTemplateAndChildren(templateLibrary, selections,
    selectionRelationships, metadata, jobId, newSelectionTemplate, selectionValue,
    expectedVariableCollectorSelection, 0, Constants.selectionAddingModes.handleAnything, null, lookupData);

  // store the overrideTemplate id responsible so that we know whether it was from a specification group
  addOrUpdateSelectionSettings(templateLibrary, newSelection, [ { key: Constants.selectionSettingKeys.overrideTemplateId, value: overrideTemplate.id } ]);

  // There is no longer a selectionToOverride since a new selection was created.
  return {selectionToOverride: null, levelFromHere: 0};
}

// Return the first selection most closely related to this selection whose template defines a variable named variableToOverride.
// First check if this selection could be it, then child selections, then parent selections.
function getSelectionToOverride(templateLibrary, selection, variableToOverride,
  selectionIdsToIgnore, selections, selectionRelationships, levelFromHere) {
  let returnValue = {selectionToOverride: null, levelFromHere};

  if (!_.contains(selectionIdsToIgnore, selection._id)) {
    selectionIdsToIgnore.push(selection._id);

    let selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary, selection.templateId);

    //First check selection
    if (selectionTemplate &&
      ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.variableName)
      === variableToOverride) {
      returnValue.selectionToOverride = selection;
    }

    //Next check child selections that are not sub templates and not variable collectors
    if (!returnValue.selectionToOverride) {
      let childSelections = SelectionsHelper.getChildSelections(selection, selections, selectionRelationships);
      if (childSelections) {
        childSelections.forEach(function (childSelection) {
          const childSelectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary, childSelection.templateId);
          if (!returnValue.selectionToOverride && childSelectionTemplate &&
            !ItemTemplatesHelper.getTemplateSettingValueForTemplate(childSelectionTemplate, Constants.templateSettingKeys.isVariableCollector) &&
            !ItemTemplatesHelper.isASubTemplate(childSelectionTemplate)) {
            returnValue = getSelectionToOverride(templateLibrary, childSelection, variableToOverride,
              selectionIdsToIgnore, selections, selectionRelationships, levelFromHere - 1);
          }
        });
      }
    }

    //Next check selections of base templates?

    //Lastly check parent selections as long as selection is not a variable collector
    if (!returnValue.selectionToOverride) {
      const isVariableCollector = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.isVariableCollector);
      let parentSelections = SelectionsHelper.getParentSelections(selection, selections, selectionRelationships);
      if (parentSelections) {
        parentSelections.forEach(function (parentSelection) {
          if (!returnValue.selectionToOverride) {
            returnValue = getSelectionToOverride(templateLibrary, parentSelection, variableToOverride,
              selectionIdsToIgnore, selections, selectionRelationships, levelFromHere + 1);
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
    _.each(TemplateLibrariesHelper.getTemplateChildren(templateLibrary, template), (childTemplate) => {
      populateTemplateIds(templateLibrary, templateIds, childTemplate, true);
    });
  }
};

//Return array of all selections that are children (or grandchildren, Etc.) that match template.
//
function getSelectionsBySelectionParentAndTemplate(templateLibrary, selections,
  selectionRelationships, selectionParent, template) {
  var templateIds = [];
  if (typeof selectionParent === 'string') {
    selectionParent = _.find(selections, (selection) => selection._id === selectionParent);
  }
  populateTemplateIds(templateLibrary, templateIds, template, false);

  return getSelectionsBySelectionParentAndTemplateIds(templateLibrary, selections,
    selectionRelationships, selectionParent, templateIds);
};

function getSelectionsBySelectionParentAndTemplateIds(templateLibrary, selections,
  selectionRelationships, selectionParent, templateIds) {
  var selectionsToReturn = [];

  populateSelectionsBySelectionParent(templateLibrary, selections,
    selectionRelationships, selectionParent);

  return selectionsToReturn;

  function populateSelectionsBySelectionParent(templateLibrary, selections,
    selectionRelationships, selectionParent) {
    if (selectionParent) {
      const childSelections = getChildSelections(selectionParent, selections,
        selectionRelationships);
      _.each(childSelections, (childSelection) => {
        if (_.contains(templateIds, childSelection.templateId)) {
          selectionsToReturn.push(childSelection);
        } else {
          const selectionTemplate = TemplateLibrariesHelper.getTemplateById([templateLibrary], childSelection.templateId);
          if (selectionTemplate &&
              !SelectionsHelper.getSettingValue(childSelection, selectionTemplate,
              Constants.templateSettingKeys.isVariableCollector)) {
            // Check for descendent selections for the template. Often the desired selection is a grandchild of the original selectionParent.
            populateSelectionsBySelectionParent(templateLibrary, selections,
              selectionRelationships, childSelection);
          }
        }
      });
    }
  }
};

const getVariableCollectorSelection = (templateLibraries, selections, selectionRelationships, selection) => {
  if (!templateLibraries || !selection) {return null;}

  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
  if (selectionTemplate &&
    ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.isVariableCollector)) {
    return selection;
  }

  const parentSelection = SelectionsHelper.getParentSelections(selection, selections, selectionRelationships)[0];
  if (parentSelection) {
    return getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, parentSelection);
  }

  return null;
}

//Create variable (if ValueFormula template setting exists) for selection and its children.
function createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, selection) {
  if (!selection) {
    return;
  }
  var childSelections = getChildSelections(selection, selections, selectionRelationships);

  _.each(childSelections, (childSelection) => {
    createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, childSelection);
  });

  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
  if (!selectionTemplate) {
    return;
  }

  const jsonVariableName = ItemTemplatesHelper.getJsonVariableName(selectionTemplate);
  if (!jsonVariableName) {
    return;
  }

  const variableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection);
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

const getSelectionByTemplate = (selections, template) => {
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

const addSelectionReferencingVariable = (metadata, jsonVariableName, selectionReferencingVariable, variableCollectorSelection) => {
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

const getJsonVariableValue = (templateLibraries, selections, selectionRelationships, metadata,
  selection, jsonVariableName, selectionReferencingVariable) => {
    var variableCollectorSelection = selection
      ? getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection)
      : null;
    if (variableCollectorSelection) {
      metadata.variables[variableCollectorSelection._id] = metadata.variables[variableCollectorSelection._id] || {};
      let variableValue = metadata.variables[variableCollectorSelection._id][jsonVariableName];
      if (variableValue !== undefined) {
        if (selectionReferencingVariable && variableCollectorSelection._id !== selectionReferencingVariable._id) {
          addSelectionReferencingVariable(metadata, jsonVariableName, selectionReferencingVariable, variableCollectorSelection);
        }

        return variableValue;
      }

      // variableCollectorSelection does not contain variable, so check its parent.
      const parentSelection = SelectionsHelper.getParentSelections(variableCollectorSelection, selections, selectionRelationships)[0];
      if (parentSelection) {
        variableValue = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
          parentSelection, jsonVariableName, selectionReferencingVariable);
        // copy parent's variable value into this variable collector's variable value
        //metadata.variables[variableCollectorSelection._id][jsonVariableName] = variableValue;
        return variableValue;
      }
    }

    return undefined;
};

const refreshSelectionsReferencingVariable =
  (templateLibraries, selections, selectionRelationships, metadata, lookupData, variableCollectorSelection, jsonVariableName) => {
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
          SelectionsHelper.getSelectionValue(templateLibraries, selections, selectionRelationships, metadata, lookupData, selectionReferencingVariable);
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

const replaceValueFormulaLookupValues = (templateLibraries, selections, selectionRelationships,
    metadata, lookupData, selection, valueFormula, selectionReferencingVariable) => {
  // expecting valueFormula like `getLookup${lookupType}(${lookupKey})`, for example `getLookupPrice(drawerSlides)`
  if (valueFormula) {
    const lookupMatches = Formulas.findLookups(valueFormula);
    if (lookupMatches) {
      _.each(lookupMatches, (lookupMatch) => {
        const {lookupType, templateVariableName} = Formulas.parseLookupInfo(lookupMatch);
        if (lookupType && templateVariableName) {
          const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
          const jsonVariableValue = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
            selection, jsonVariableName, selectionReferencingVariable);
          const lookupValue = LookupsHelper.getLookupValue(lookupData, lookupType, jsonVariableValue) || '0';
          valueFormula = valueFormula.replace(lookupMatch, lookupValue);
        }
      });
    }
  }
  return valueFormula;
}

const calculateFormulaValue = (templateLibraries, selections, selectionRelationships,
    metadata, lookupData, selection, valueFormula, selectionReferencingVariable) => {
  if (!selection) {
    return 0;
  }

  valueFormula = replaceValueFormulaLookupValues(templateLibraries, selections, selectionRelationships,
      metadata, lookupData, selection, valueFormula, selectionReferencingVariable);
  const expr = Parser.parse(valueFormula);
  let formulaValue = 0;
  let variableValues = {};
  let allVariableValuesFound = true;
  expr.variables().forEach((templateVariableName) => {
    if (allVariableValuesFound) {
      const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
      const jsonVariableValue = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
        selection, jsonVariableName, selectionReferencingVariable);

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

const sumSelections = (templateLibraries, selections, selectionRelationships,
    metadata, lookupData, selectionsToSum, valueFormula, selectionReferencingVariable) => {
  if (!selectionsToSum) {
    return 0;
  }

  const add = (previousValue, selectionId) => {
    const selection = _.find(selections, (_selection) => _selection._id === selectionId);
    const {formulaValue, allVariableValuesFound} = calculateFormulaValue(
        templateLibraries, selections, selectionRelationships,
        metadata, lookupData, selection, valueFormula, selectionReferencingVariable);
    return previousValue + formulaValue;
  };

  return selectionsToSum.reduce(add, 0);
};

// This currently does not go through all descendents... only looks at descendents if templeType matches
// Intended to add all children of a particular type but needed to get descendents of children for area selections
const addDescendentSelectionsByTemplateType = (templateLibraries, selections, selectionRelationships, metadata, descendentSelectionIds, selectionParent, templateType) => {
  if (selectionParent) {
    const childSelections = getChildSelections(selectionParent, selections, selectionRelationships);
    _.each(childSelections, (childSelection) => {
      const childSelectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, childSelection.templateId);
      if (childSelectionTemplate && childSelectionTemplate.templateType === templateType) {
        descendentSelectionIds.push(childSelection._id);
      } else {
        //Now add descendents of this child (but only for children with the requested templateType)
        addDescendentSelectionsByTemplateType(templateLibraries, selections, selectionRelationships, metadata, descendentSelectionIds, childSelection, templateType);
      }
    });
  }
};

// This currently does not go through all descendents... only looks at descendents if templeType matches
const getDescendentSelectionIdsByTemplateType = (templateLibraries, selections, selectionRelationships, metadata, selectionParent, templateType) => {
  if (selectionParent) {
    let descendentSelectionIds = [];
    addDescendentSelectionsByTemplateType(templateLibraries, selections, selectionRelationships, metadata, descendentSelectionIds, selectionParent, templateType);
    return descendentSelectionIds;
  }

  return null;
};

const applyFunctionOverChildrenOfParent = (templateLibraries, selections, selectionRelationships, metadata, lookupData, selection) => {
  let returnValue = undefined;
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
  const applicableTemplateType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'ApplicableTemplateType');
  const parentSelection = SelectionsHelper.getParentSelections(selection, selections, selectionRelationships)[0];
  const descendentSelectionIds = getDescendentSelectionIdsByTemplateType(
    templateLibraries, selections, selectionRelationships, metadata, parentSelection, applicableTemplateType);
  const functionName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'Function');
  const valueFormula = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'ValueFormula');

  if (functionName.toUpperCase() === 'SUM') {
    returnValue = sumSelections(templateLibraries, selections, selectionRelationships,
      metadata, lookupData, descendentSelectionIds, valueFormula, selection);
  }
  return returnValue;
};

const getDisplayValue = (templateLibraries, selections, selection) => {
  if (selection) {
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
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

const getCustomValue = (templateLibraries, selections, selectionRelationships, metadata, lookupData,
    customLookup, selection, selectionTemplate) => {
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
    jsonVariableValue = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
      selection, jsonVariableName, selection);
    if (jsonVariableValue !== undefined) {
      caseMaterialInteriorSku = jsonVariableValue;
    }

    caseMaterialExposedSku = getSettingValue(selection, selectionTemplate, 'CaseMaterialExposedSku');
    jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(caseMaterialExposedSku);
    jsonVariableValue = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
      selection, jsonVariableName, selection);
    if (jsonVariableValue !== undefined) {
      caseMaterialExposedSku = jsonVariableValue;
    }

    const nominalThickness = getSettingValue(selection, selectionTemplate, 'NominalThickness');

    //Now need to look up the most appropriate sheet material offering
    const sheetMaterialData = lookupData && lookupData['sheetMaterialData'];

    //This should be something that can be set per job
    const pricingDate = new Date();

    // For now just get the first qualifying price
    if (sheetMaterialData) {
      _.each(sheetMaterialData, (sheetMaterial) => {
        if (sheetMaterial.coreMaterial && sheetMaterial.coreMaterial.sku === caseMaterialExposedSku) {
          _.each(sheetMaterial.sheetMaterialOfferings, (sheetMaterialOffering) => {
            if (sheetMaterialOffering.nominalThickness == nominalThickness) {
              sheetMaterialOffering.sheetMaterialPricings.forEach(function (sheetMaterialPricing) {
                if (sheetMaterialPricing.effectiveDate <= pricingDate
                    && sheetMaterialPricing.expirationDate >= pricingDate) {
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

const getSelectionValue = (templateLibraries, selections, selectionRelationships, metadata, lookupData, selection) => {
  if (!selection) {
    throw new Error('selection required in getSelectionValue');
  }
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
  let selectionValue;
  let selectionValueSource = selection.valueSource;
  const variableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection);
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
      selectionValue = applyFunctionOverChildrenOfParent(templateLibraries, selections, selectionRelationships, metadata, lookupData, selection);
      selectionValueSource = Constants.valueSources.calculatedValue;
    }
    //Check for a custom lookup
    else if (customLookup = getSettingValue(selection, selectionTemplate, Constants.templateSettingKeys.customLookup)) {
      selectionValue = getCustomValue(templateLibraries, selections, selectionRelationships, metadata, lookupData,
        customLookup, selection, selectionTemplate);
      selectionValueSource = Constants.valueSources.lookup;
    }
    //Check for valueFormula, which evaluates based on variables.
    else if (valueFormula = getSettingValue(selection,
      selectionTemplate, Constants.templateSettingKeys.valueFormula)) {
      const {formulaValue, allVariableValuesFound} = calculateFormulaValue(templateLibraries, selections, selectionRelationships,
          metadata, lookupData, selection, valueFormula, selection);
      if (allVariableValuesFound) {
        selectionValue = formulaValue;
        selectionValueSource = Constants.valueSources.calculatedValue;
      }
    }
    //If no ValueFormula, check for VariableToDisplay.
    else if (variableToDisplay = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
        selectionTemplate, Constants.templateSettingKeys.variableToDisplay)) {
      const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(selectionTemplate.variableToDisplay);
      selectionValue = getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
        selection, jsonVariableName, selection);
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

  storeSelectionValueAndUpdatePendingChanges(templateLibraries, selections, selectionRelationships,
    metadata, lookupData, selection, selectionValue, selection.value, variableCollectorSelection,
    variableCollectorSelectionVariableSet, originalValueSource, selectionValueSource, selectionJsonVariableName);
  return selectionValue;
};

const initializeValueToUse = (templateLibraries, selections, selectionRelationships, metadata, lookupData, selection) => {
  if (!selection) {
    return;
  }

  const childSelections = getChildSelections(selection, selections, selectionRelationships);
  _.each(childSelections, (childSelection) => {
    initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, lookupData, childSelection);
  });

  //Calling getSelectionValue() causes checks for undefined variables.
  getSelectionValue(templateLibraries, selections, selectionRelationships, metadata, lookupData, selection);
};

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

const initializeSelectionVariables = (templateLibraries, selections, selectionRelationships, metadata, lookupData) => {
  // start with the topmost selection, which should be the company selection
  const companyTemplate = TemplateLibrariesHelper.getTemplateByType(templateLibraries, Constants.templateTypes.company);
  if (!companyTemplate) {
    return;
  }

  const companySelection = getSelectionByTemplate(selections, companyTemplate);
  if (!companySelection) {
    return;
  }

  createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, companySelection);

  initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, lookupData, companySelection);

  //If any dependent variables are undefined, then something must be wrong.
  if (metadata.variablesUndefined.length > 0) {
    console.log('Variables not defined:' + metadata.variablesUndefined.join(","));
      // throw new Error('Variables not defined:' + metadata.variablesUndefined.join(","));
  }
};

const getDisplayDescription = (templateLibraries, selections, selectionRelationships, selection) => {
  if (selection) {
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
    if (selectionTemplate) {
      const templateVariableName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, 'VariableName');
      if (templateVariableName) {
        const parentSelection = SelectionsHelper.getParentSelections(selection, selections, selectionRelationships)[0];
        if (parentSelection) {
          const parentSelectionDisplayDescription = getDisplayDescription(templateLibraries, selections, selectionRelationships, parentSelection);
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

const getPendingChangeMessages = (templateLibraries, selections, selectionRelationships, metadata) => {
  return _.reduce(
    metadata.pendingSelectionChanges,
    (pendingChangeMessages, pendingChangeMessagesWithoutSelectionDescription, selectionId) => {
      const selection = _.find(selections, (selection) => selection._id === selectionId);
      const selectionDisplayDescription = getDisplayDescription(templateLibraries, selections, selectionRelationships, selection);
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

const storeSelectionValueAndUpdatePendingChanges = (templateLibraries, selections,
    selectionRelationships, metadata, lookupData, selection, selectionValue, oldValue, variableCollectorSelection,
    variableCollectorSelectionVariableSet, originalValueSource, selectionValueSource,
    selectionJsonVariableName) => {
  const originalValue = oldValue;
  const originalDisplayValue = getDisplayValue(templateLibraries, selections, selection);
  if (selectionValue !== undefined
      && selectionValue !== null &&
      (variableCollectorSelectionVariableSet || oldValue !== selectionValue.toString())) {
    if (oldValue !== selectionValue.toString()) {
      selection.value = selectionValue.toString();
      // afterSettingValue(selection);
    }

    // Make sure formulas that reference this selection's variable get updated
    if (selectionJsonVariableName && variableCollectorSelection) {
      refreshSelectionsReferencingVariable(templateLibraries, selections, selectionRelationships,
        metadata, lookupData, variableCollectorSelection, selectionJsonVariableName);
    }
  }

  const isGettingInserted = _.contains(metadata.selectionIdsToBeInserted, selection._id);
  const currentDisplayValue = getDisplayValue(templateLibraries, selections, selection);
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

const setSelectionValue = (templateLibraries, selections, selectionRelationships,
    metadata, lookupData, selection, selectionValue, oldValue, originalValueSource, selectionValueSource) => {
  const templateLibrary = TemplateLibrariesHelper.getTemplateLibraryWithTemplate(templateLibraries, selection.templateId);
  const selectionTemplate = _.find(templateLibrary.templates, (template) => template.id === selection.templateId);
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
    variableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection);
    jsonVariableName = ItemTemplatesHelper.getJsonVariableName(selectionTemplate);

    if (jsonVariableName && variableCollectorSelection
      && metadata.variables
      && metadata.variables[variableCollectorSelection._id]
      && metadata.variables[variableCollectorSelection._id][jsonVariableName] !== selectionValue) {
      metadata.variables[variableCollectorSelection._id][jsonVariableName] = selectionValue;

      variableCollectorSelectionVariableSet = true;
      // refreshSelectionsReferencingVariable(templateLibraries, selections,
      //   selectionRelationships, metadata, variableCollectorSelection, jsonVariableName);
    }
  }

  if (oldValue !== selectionValue || variableCollectorSelectionVariableSet) {
    storeSelectionValueAndUpdatePendingChanges(templateLibraries, selections,
      selectionRelationships, metadata, lookupData, selection, selectionValue, oldValue, variableCollectorSelection,
      variableCollectorSelectionVariableSet, originalValueSource, selectionValueSource, jsonVariableName);
  }
}

const getVariableCollectorSelectionWithVariableValue = (templateLibraries,
    selections, selectionRelationships, metadata, selection, jsonVariableName) => {
  if (!selection) {
    return null;
  }
  const variableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection);
  if (jsonVariableName && variableCollectorSelection
      && metadata.variables
      && metadata.variables[variableCollectorSelection._id]
      && metadata.variables[variableCollectorSelection._id][jsonVariableName] !== undefined) {
    return variableCollectorSelection;
  }
  const parentSelection = SelectionsHelper.getParentSelections(variableCollectorSelection, selections, selectionRelationships)[0];
  return getVariableCollectorSelectionWithVariableValue(templateLibraries,
      selections, selectionRelationships, metadata, parentSelection, jsonVariableName);
}

const isCandidateSelectionAnAncestor = (selections, selectionRelationships, selection, candidateSelection) => {
  if (!selection || !candidateSelection) {
    return false;
  }
  if (selection._id === candidateSelection._id) {
    return true;
  }
  const parentSelection = SelectionsHelper.getParentSelections(selection, selections, selectionRelationships)[0];
  return isCandidateSelectionAnAncestor(selections, selectionRelationships, parentSelection, candidateSelection);
}

// If there is a variable associated with this template, a different selection up the hierarchy is
// probably its variableCollectorSelection, so we need to find all of the
// selectionIdsReferencingVariables and move some of them to the new variableCollectorSelection.
// Essentially we need to move the ones that have the new variableCollectorSelection as an ancestor.
const moveVariableReferencesToNewVariableCollectorSelection = (templateLibraries, template,
    selections, selectionRelationships, metadata, selection) => {
  const jsonVariableName = ItemTemplatesHelper.getJsonVariableName(template);
  const oldVariableCollectorSelection = getVariableCollectorSelectionWithVariableValue(templateLibraries,
    selections, selectionRelationships, metadata, selection, jsonVariableName);
  const newVariableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection);

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
            isCandidateSelectionAnAncestor(selections, selectionRelationships, selectionReferencingVariable, newVariableCollectorSelection)) {
          oldSelectionIdsReferencingVariable.selectionIds.splice(oldIndex, 1);
          newSelectionIdsReferencingVariable.selectionIds.push(selectionReferencingVariableId);
        }
      };
    }
  }
}

// See also jobs method version of addSelectionForTemplate
const addSelectionForTemplate = (templateLibrary, selections, selectionRelationships,
    metadata, jobId, template, selectionValue, parentSelectionId, childOrder, lookupData) => {
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
    jobId: jobId,
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
      jobId: jobId,
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
  moveVariableReferencesToNewVariableCollectorSelection([templateLibrary], template,
    selections, selectionRelationships, metadata, selection);

  // Call getSelectionValue to update relevant metadata (or maybe instead setSelectionValue)
  setSelectionValue([templateLibrary], selections, selectionRelationships,
      metadata, lookupData, selection, selection.value, null, Constants.valueSources.nothing, Constants.valueSources.userEntry);
  // getSelectionValue(templateLibrary, selections, selectionRelationships, metadata, lookupData, selection);

  return selection;
};

const addOrUpdateSelectionSettings = (templateLibrary, selection, selectionSettingsToAddOrUpdate) => {
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

const addSelectionsForChildTemplateRelationship = (templateLibrary, selections,
    selectionRelationships, metadata, jobId, selection, template,
    selectionAddingMode, templateRelationship, templateToStopAt, lookupData) => {
  const childTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary, templateRelationship.childTemplateId);
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
          overrideValue = `getLookup${lookupType}(${lookupKeyVariable})`;
        }
        let overrideType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.overrideType);
        const {selectionToOverride, levelFromHere} =
          getSelectionToOverrideOrAddIfAppropriate(templateLibrary, selection, variableToOverride,
            [], selections, selectionRelationships, overrideValue, lookupData, metadata, jobId, childTemplate);
        if (selectionToOverride) {
          // if overrideType is fromSpecificationGroup  and selectionToOverride's overrideType is fromSpecificationGroup, just update the selection
          const overrideTemplateId = getSelectionSettingValueForSelection(selectionToOverride, Constants.selectionSettingKeys.overrideTemplateId);
          const overrideTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary, overrideTemplateId);
          let selectionToOverrideOverrideType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(overrideTemplate, Constants.templateSettingKeys.overrideType);
          if (overrideType === Constants.overrideTypes.fromSpecificationGroup && selectionToOverrideOverrideType === Constants.overrideTypes.fromSpecificationGroup) {
            setSelectionValue([templateLibrary], selections, selectionRelationships,
                metadata, lookupData, selectionToOverride, overrideValue,
                selectionToOverride.value, selectionToOverride.valueSource, Constants.valueSources.defaultValue);
          } else {
            addOrUpdateSelectionSettings(templateLibrary, selectionToOverride, [ { key: propertyToOverride, value: overrideValue, levelFromHere, overrideType } ]);
          }
        }
      } else if (isASubTemplate) {
        //Don't do anything. Sub templates are now handled in ProductSelection case.
      } else if (isABaseTemplate) {
        //If template IsABaseTemplate then don't add selection for this template now, just add selections for all of
        //its child sub templates (and they will add this template's other children).
        addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata,
          jobId, selection, childTemplate, Constants.selectionAddingModes.onlySubTemplates, templateToStopAt, lookupData);
      } else {
        // SelectionsHelper.getSelectionValue(templateLibraries[0], selections, selectionRelationships, metadata, selection) => {
        const defaultValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.defaultValue);

        //Not a base template or a sub template, so no matter the adding mode should go back to handling everything
        addSelectionsForTemplateAndChildren(templateLibrary, selections, selectionRelationships,
          metadata, jobId, childTemplate, defaultValue, selection, 0, Constants.selectionAddingModes.handleAnything, templateToStopAt, lookupData);
      }
    }
  }
};

const isTemplateConditionMet = (templateLibrary, selections, selectionRelationships, metadata, selection, template) => {
  const conditionType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.conditionType);
  switch (conditionType) {
    case Constants.conditionTypes.switch:
      const switchVariable = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.switchVariable);
      const switchValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.switchValue);
      const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(switchVariable);
      const jsonVariableValue = getJsonVariableValue([templateLibrary], selections, selectionRelationships, metadata,
        selection, jsonVariableName, selection);
      return jsonVariableValue == switchValue;
    default:
      return false;
  }
}

const addSelectionsForTemplateChildren = (templateLibrary, selections, selectionRelationships, metadata, jobId, selection, template,
    selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt, lookupData) => {
  if (selection && template)
  {
    //If a child template exists with the same type as templateToStopAt then just return.
    if (templateToStopAt &&
      _.find(TemplateLibrariesHelper.templateChildren(templateLibrary, template), (templateChild) => {return templateChild.templateType == templateToStopAt.templateType;})){
      return;
    }

    if (template.templateType === Constants.templateTypes.condition &&
      !isTemplateConditionMet(templateLibrary, selections, selectionRelationships, metadata, selection, template)) {
      return;
    }

    //Add selections for template children that are not SubItems (sub templates) first so that everything that might be overridden by sub template exists.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(templateLibrary, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem != Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(templateLibrary, selections, selectionRelationships,
          metadata, jobId, selection, template, selectionAddingMode, templateRelationship, null, lookupData);
      });

    //Now it's safe to add selections for template children that are SubItems.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(templateLibrary, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem == Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(templateLibrary, selections, selectionRelationships,
          metadata, jobId, selection, template, selectionAddingMode, templateRelationship, null, lookupData);
      });

    //Handle case where this is a sub template but also a parent of a sub template. So need to add the template children of the base template
    if (selectionAddingMode == Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates) {
      let isABaseTemplate = template.templateSettings
        && _.find(template.templateSettings, (templateSetting) => {
          return templateSetting.key === "IsABaseTemplate" && templateSetting.value === true.toString();
        });

      //To get here must be a sub template or base template, so go ahead and add selections for children
      addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata,
        jobId, selection, template, Constants.selectionAddingModes.ignoreSubTemplates, null, lookupData);

      //If this template is not a base template then still need to add selections for children of parent template(s)
      if (!isABaseTemplate)
      {
        _.each(TemplateLibrariesHelper.getTemplateParents(templateLibrary, template), (parentTemplate) => {
          addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata,
            jobId, selection, parentTemplate, Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates, null, lookupData);
        });
      }
    }
  }
};

const addSelectionsForTemplateAndChildren = (templateLibrary, selections, selectionRelationships, metadata,
      jobId, template, selectionValue, parentSelection, childOrder,
      selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt, lookupData) => {
  if (template.templateType === Constants.templateTypes.condition &&
    !isTemplateConditionMet(templateLibrary, selections, selectionRelationships, metadata, parentSelection, template)) {
    return null;
  }

  let selection = addSelectionForTemplate(templateLibrary, selections, selectionRelationships, metadata, jobId, template, selectionValue, parentSelection._id, childOrder, lookupData);
  addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata,
    jobId, selection, template, selectionAddingMode, templateToStopAt, lookupData);

  return selection;
};

const addSelectionChildrenOfProduct = (templateLibrary, selections, selectionRelationships, metadata, jobId, subTemplateSelection,
    productTemplate, lookupData) => {
  //Add the template children of the base template before the sub template children because they override some of these
  const parentTemplate =  TemplateLibrariesHelper.getTemplateParent(templateLibrary, productTemplate);
  const isABaseTemplate = ItemTemplatesHelper.isABaseTemplate(parentTemplate);
  const isASubTemplate = ItemTemplatesHelper.isASubTemplate(parentTemplate);
  if (!isABaseTemplate && !isASubTemplate) {
    return;
  }

  addSelectionChildrenOfProduct(templateLibrary, selections, selectionRelationships, metadata, jobId, subTemplateSelection, parentTemplate, lookupData);

  addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata, jobId, subTemplateSelection,
      parentTemplate, Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates, null, lookupData);

  //Add selection and template children for productTemplate (sub template)
  const subTemplateSelectionTemplate =  TemplateLibrariesHelper.getTemplateById(templateLibrary, subTemplateSelection.templateId);
  addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata, jobId, subTemplateSelection,
      subTemplateSelectionTemplate, Constants.selectionAddingModes.ignoreSubTemplates, null, lookupData);
};

const addProductSelectionAndChildren = (templateLibraries, pendingChanges, lookupData, parentSelection,
  productSelectionTemplate, productTemplate, childOrder) => {
  check(templateLibraries, [Schema.TemplateLibrary]);
  check(pendingChanges, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    metadata: Match.Any,
    job: Schema.Job,
  });
  check(parentSelection, Schema.Selection);
  check(productSelectionTemplate, Schema.ItemTemplate);
  check(productTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  const templateLibrary = templateLibraries && templateLibraries[0];
  const {selections, selectionRelationships, metadata, job} = pendingChanges;
  const jobId = job._id;

  //Add selection for productSelectionTemplate
  var productSelection = addSelectionsForTemplateAndChildren(templateLibrary, selections, selectionRelationships, metadata, jobId,
      productSelectionTemplate, null, parentSelection, childOrder, Constants.selectionAddingModes.ignoreBaseTemplates, null, lookupData);

  //Add selection for productTemplate (sub template) (will add template children for sub template after adding template children of base template)
  var subTemplateSelection = addSelectionForTemplate(templateLibrary, selections, selectionRelationships, metadata, jobId,
      productTemplate, productTemplate.id, productSelection._id, 0, lookupData);

  addSelectionChildrenOfProduct(templateLibrary, selections, selectionRelationships, metadata, jobId, subTemplateSelection, productTemplate, lookupData);

  initializeSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, lookupData);
  // ToDo: Make this (call to initializeSelectionVariables) faster by doing something like the commented (only update the necessary selections)
  // createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, productSelection);
  // initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, lookupData, productSelection);
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
  //     refreshSelectionsReferencingVariable(templateLibraries, pendingChanges.selections,
  //       pendingChanges.selectionRelationships, pendingChanges.metadata,
  //       variableCollectorSelection, selectionJsonVariableName);
  //   }
  // });

  return productSelection;
};

const addSpecificationGroupSelectionAndChildren = (templateLibraries, pendingChanges, lookupData, parentSelection,
  specificationGroupTemplate, selectionValue, childOrder) => {
  check(templateLibraries, [Schema.TemplateLibrary]);
  check(pendingChanges, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    metadata: Match.Any,
    job: Schema.Job,
  });
  check(parentSelection, Schema.Selection);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  const templateLibrary = templateLibraries && templateLibraries[0];
  const {selections, selectionRelationships, metadata, job} = pendingChanges;
  const jobId = job._id;

  var specificationGroupSelection = addSelectionsForTemplateAndChildren(
    templateLibrary, selections, selectionRelationships, metadata, jobId,
    specificationGroupTemplate, selectionValue, parentSelection, childOrder,
    Constants.selectionAddingModes.handleAnything, null, lookupData);

  initializeSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, lookupData);
  // createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, specificationGroupSelection);
  // initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, lookupData, specificationGroupSelection);

  return specificationGroupSelection;
};

const updateSpecificationGroupSelectionAndChildren = (templateLibraries, pendingChanges, lookupData,
  specificationGroupSelection, specificationGroupTemplate, selectionValue, childOrder) => {
  check(templateLibraries, [Schema.TemplateLibrary]);
  check(pendingChanges, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    metadata: Match.Any,
    job: Schema.Job,
  });
  check(specificationGroupSelection, Schema.Selection);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(specificationGroupTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  const templateLibrary = templateLibraries && templateLibraries[0];
  const {selections, selectionRelationships, metadata, job} = pendingChanges;
  const jobId = job._id;

  setSelectionValue(templateLibraries, selections, selectionRelationships,
      metadata, lookupData, specificationGroupSelection, selectionValue,
      specificationGroupSelection.value, specificationGroupSelection.valueSource, Constants.valueSources.override);

  deleteSelectionChildren(templateLibraries, pendingChanges, lookupData, specificationGroupSelection);

  addSelectionsForTemplateChildren(templateLibrary, selections, selectionRelationships, metadata,
    jobId, specificationGroupSelection, specificationGroupTemplate,
    Constants.selectionAddingModes.handleAnything, null, lookupData);

  initializeSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, lookupData);
  // createSelectionVariables(templateLibraries, selections, selectionRelationships, metadata, specificationGroupSelection);
  // initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, lookupData, specificationGroupSelection);

  return specificationGroupSelection;
};

// Actually deletes selection, parent selection relationships (but not parent selection), child selection relationships,
// and all descendent selections (children, grandchildren, etc.)
// const deleteSelectionAndRelated = (templateLibraries, selections, selectionRelationships, selectionToDelete) => {
const deleteSelectionAndRelated = (templateLibraries, pendingChanges, lookupData, selectionToDelete) => {
  check(templateLibraries, [Schema.TemplateLibrary]);
  check(pendingChanges, {
    selections: [Schema.Selection],
    selectionRelationships: [Schema.SelectionRelationship],
    metadata: Match.Any,
    job: Match.Any,
  });
  // check(selections, [Schema.Selection]);
  // check(selectionRelationships, [Schema.SelectionRelationship]);
  check(selectionToDelete, Schema.Selection);
  const {selections, selectionRelationships} = pendingChanges;
  const addSelectionAndRelationshipIdsOfDescendents = (selectionToDelete, selectionsToDelete, selectionRelationshipIds) => {
    selectionsToDelete.push(selectionToDelete);
    const childRelationships = _.filter(selectionRelationships,
      (relationship) => relationship.parentSelectionId === selectionToDelete._id);
    _.each(childRelationships, (relationship) => {
      selectionRelationshipIdsToDelete.push(relationship._id);
      const childSelection = _.find(selections, (selection) => selection._id === relationship.childSelectionId);
      addSelectionAndRelationshipIdsOfDescendents(childSelection, selectionsToDelete, selectionRelationshipIds);
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

  selectionRefreshesNeeded = [];
  _.each(selectionsToDelete, (selectionToDelete) => {
    const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selectionToDelete.templateId);
    const variableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selectionToDelete);
    const populateSelectionRefreshesNeeded = (selectionJsonVariableName) => {
      if (selectionJsonVariableName) {
        selectionRefreshesNeeded.push({variableCollectorSelection, selectionJsonVariableName});
      }
    }
    if (selectionTemplate) {
      populateSelectionRefreshesNeeded(ItemTemplatesHelper.getJsonVariableName(selectionTemplate));
      // a condition selection can impact variables determined by each of its children
      if (selectionTemplate.templateType === Constants.templateTypes.condition) {
        const templateChildren = TemplateLibrariesHelper.getTemplateChildren(templateLibraries[0], selectionTemplate);
        _.each(templateChildren, (templateChild) => {
          const templateVariableName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(templateChild, 'VariableToOverride');
          const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(templateVariableName);
          populateSelectionRefreshesNeeded(jsonVariableName);
        });
      }
    }
  })
  pendingChanges.selections = _.filter(selections, (selection) =>
    !_.any(selectionsToDelete, (selectionToDelete) => selectionToDelete._id === selection._id));
  pendingChanges.selectionRelationships = _.filter(selectionRelationships, (selectionRelationship) => !_.contains(selectionRelationshipIdsToDelete, selectionRelationship._id));

  // Remove deleted selections from metadata
  const selectionIdsToDelete = _.map(selectionsToDelete, (selectionToDelete) => selectionToDelete._id);
  pendingChanges.metadata.selectionIdsReferencingVariables =
    _.omit(pendingChanges.metadata.selectionIdsReferencingVariables, (value, key) => _.contains(selectionIdsToDelete, key));

  // Make sure formulas that reference deleted selection variables get updated
  _.each(selectionRefreshesNeeded, (selectionInfo) => {
    const {variableCollectorSelection, selectionJsonVariableName} = selectionInfo;
    if (selectionJsonVariableName && variableCollectorSelection) {
      refreshSelectionsReferencingVariable(templateLibraries, pendingChanges.selections,
        pendingChanges.selectionRelationships, pendingChanges.metadata, lookupData,
        variableCollectorSelection, selectionJsonVariableName);
    }
  });
};

const deleteSelectionChildren = (templateLibraries, pendingChanges, lookupData, selection) => {
  const {selections, selectionRelationships} = pendingChanges;
  const childSelections = getChildSelections(selection, selections, selectionRelationships);
  _.each(childSelections, (childSelection) => {
    deleteSelectionAndRelated(templateLibraries, pendingChanges, lookupData, childSelection);
  });
};

const getSpecificationListInfo = (templateLibraries, pendingChanges, lookupData,
  applicableSpecificationGroupTemplates, selection) => {
  const {metadata, selections, selectionRelationships} = pendingChanges;
  let specifications = [];
  _.each(applicableSpecificationGroupTemplates, (template) => {
    const selectionItem = new InputSelectionItem(templateLibraries, pendingChanges,
      template, selection._id, lookupData);
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
  addSpecificationGroupSelectionAndChildren,
  applyFunctionOverChildrenOfParent: applyFunctionOverChildrenOfParent,
  deleteSelectionAndRelated,
  deleteSelectionChildren,
  getChildSelections: getChildSelections,
  getChildSelectionsWithTemplateId: getChildSelectionsWithTemplateId,
  getChildSelectionsWithTemplateIds: getChildSelectionsWithTemplateIds,
  getDisplayValue: getDisplayValue,
  getInitializedMetadata: getInitializedMetadata,
  getJsonVariableValue: getJsonVariableValue,
  getParentSelections: getParentSelections,
  getPendingChangeMessages: getPendingChangeMessages,
  getSelectionByTemplate: getSelectionByTemplate,
  getSettingValue: getSettingValue,
  getSelectionToOverride: getSelectionToOverride,
  getSelectionsBySelectionParentAndTemplate: getSelectionsBySelectionParentAndTemplate,
  getSelectionValue: getSelectionValue,
  getSpecificationListInfo,
  getVariableCollectorSelection: getVariableCollectorSelection,
  initializeMetadata,
  initializeSelectionVariables: initializeSelectionVariables,
  setSelectionValue: setSelectionValue,
  sumSelections: sumSelections,
  updateSpecificationGroupSelectionAndChildren,
}
