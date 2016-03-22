Selections = new Mongo.Collection("selections");

Schema.SelectionSetting = new SimpleSchema({
  key: {
    type: String
  },
  value: {
    type: String,
    optional: true
  }//,
  // templateSettingId: {
  //   type: String
  // }
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
  parentSelectionId: {
    type: String
  },
  childSelectionId: {
    type: String
  },
  order: {
    type: Number
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

// Return the first selection most closely related to this selection whose template defines a variable named variableToOverride.
// First check if this selection could be it, then child selections, then parent selections.
function getSelectionToOverride(templateLibrary, selection, variableToOverride, selectionIdsToIgnore) {
  var selectionToOverride = null;

  if (!_.contains(selectionIdsToIgnore, selection._id)) {
    selectionIdsToIgnore.push(selection._id);

    let selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibrary, selection.templateId);

    //First check selection
    if (selectionTemplate &&
      ItemTemplatesHelper.getTemplateSettingValueForTemplate(selectionTemplate, Constants.templateSettingKeys.variableName)
      === variableToOverride) {
      selectionToOverride = selection;
    }

    //Next check child selections
    //if (selectionTemplate.templateType !== Constants.templateTypes.productSelection) {
    let childSelections = SelectionsHelper.getChildSelections(selection);
    if (!selectionToOverride && childSelections) {
      childSelections.forEach(function (childSelection) {
        if (!selectionToOverride &&
          !ItemTemplatesHelper.isASubTemplate(childSelection.templateId)) {
          selectionToOverride = getSelectionToOverride(templateLibrary, childSelection, variableToOverride, selectionIdsToIgnore);
        }
      });
    }
    //}

    //Next check selections of base templates?

    //Lastly check parent selections
    let parentSelections = SelectionsHelper.getParentSelections(selection);
    if (!selectionToOverride && parentSelections) {
      parentSelections.forEach(function (parentSelection) {
        if (!selectionToOverride) {
          selectionToOverride = getSelectionToOverride(templateLibrary, parentSelection, variableToOverride, selectionIdsToIgnore);
        }
      });
    }
  }

  return selectionToOverride;
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
function getSelectionsBySelectionParentAndTemplate(templateLibrary, selections,
  selectionRelationships, selectionParent, template) {
  var templateIds = [];
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
        if (_.indexOf(templateIds, childSelection.templateId) !== -1) {
          selectionsToReturn.push(childSelection);
        } else {
          // Check for descendent selections for the template. Often the desired selection is a grandchild of the original selectionParent.
          populateSelectionsBySelectionParent(templateLibrary, selections,
            selectionRelationships, childSelection);
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
      const variableValue = metadata.variables[variableCollectorSelection._id][jsonVariableName];
      if (variableValue !== undefined) {
        if (selectionReferencingVariable && variableCollectorSelection._id !== selectionReferencingVariable._id) {
          addSelectionReferencingVariable(metadata, jsonVariableName, selectionReferencingVariable, variableCollectorSelection);
        }

        return variableValue;
      }

      // variableCollectorSelection does not contain variable, so check its parent.
      const parentSelection = SelectionsHelper.getParentSelections(variableCollectorSelection, selections, selectionRelationships)[0];
      if (parentSelection) {
        return getJsonVariableValue(templateLibraries, selections, selectionRelationships, metadata,
          parentSelection, jsonVariableName, selectionReferencingVariable);
      }
    }

    return null;
};

const refreshSelectionsReferencingVariable =
  (templateLibraries, selections, selectionRelationships, metadata, variableCollectorSelection, jsonVariableName) => {
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
          SelectionsHelper.getSelectionValue(templateLibraries, selections, selectionRelationships, metadata, selectionReferencingVariable);
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

const calculateFormulaValue = (templateLibraries, selections, selectionRelationships,
    metadata, selection, valueFormula, selectionReferencingVariable) => {
  if (!selection) {
    return 0;
  }

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
    metadata, selectionsToSum, valueFormula, selectionReferencingVariable) => {
  if (!selectionsToSum) {
    return 0;
  }

  const add = (previousValue, selection) => {
    const {formulaValue, allVariableValuesFound} = calculateFormulaValue(
        templateLibraries, selections, selectionRelationships,
        metadata, selection, valueFormula, selectionReferencingVariable)
    return previousValue + formulaValue;
  };

  return selectionsToSum.reduce(add, 0);
};

// This currently does not go through all descendents... only looks at descendents if templeType matches
// Intended to add all children of a particular type but needed to get descendents of children for area selections
const addDescendentSelectionsByTemplateType = (templateLibraries, selections, selectionRelationships, metadata, descendentSelections, selectionParent, templateType) => {
  if (selectionParent) {
    const childSelections = getChildSelections(selectionParent, selections, selectionRelationships);
    _.each(childSelections, (childSelection) => {
      const childSelectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, childSelection.templateId);
      if (childSelectionTemplate && childSelectionTemplate.templateType === templateType) {
        descendentSelections.push(childSelection);
      } else {
        //Now add descendents of this child (but only for children with the requested templateType)
        addDescendentSelectionsByTemplateType(templateLibraries, selections, selectionRelationships, metadata, descendentSelections, childSelection, templateType);
      }
    });
  }
};

// This currently does not go through all descendents... only looks at descendents if templeType matches
const getDescendentSelectionsByTemplateType = (templateLibraries, selections, selectionRelationships, metadata, selectionParent, templateType) => {
  if (selectionParent) {
    let descendentSelections = [];
    addDescendentSelectionsByTemplateType(templateLibraries, selections, selectionRelationships, metadata, descendentSelections, selectionParent, templateType);
    return descendentSelections;
  }

  return null;
};

const applyFunctionOverChildrenOfParent = (templateLibraries, selections, selectionRelationships, metadata, selection) => {
  let returnValue = undefined;
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
  const applicableTemplateType = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'ApplicableTemplateType');
  const parentSelection = SelectionsHelper.getParentSelections(selection)[0];
  const descendentSelections = getDescendentSelectionsByTemplateType(
    templateLibraries, selections, selectionRelationships, metadata, parentSelection, applicableTemplateType);
  const functionName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'Function');
  const valueFormula = ItemTemplatesHelper.getTemplateSettingValueForTemplate(
    selectionTemplate, 'ValueFormula');

  if (functionName.toUpperCase() === 'SUM') {
    returnValue = sumSelections(templateLibraries, selections, selectionRelationships,
      metadata, descendentSelections, valueFormula, selection);
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
  originalValueSource, currentValue, currentDisplayValue, currentValueSource) => {
  let pendingChangeMessages = [];
  if (originalValueSource !== currentValueSource) {
    pendingChangeMessages.push(`source change from ${originalValueSource} to ${currentValueSource}`);
  }
  if (originalValue !== currentValue) {
    pendingChangeMessages.push(`value change from ${originalDisplayValue} to ${currentDisplayValue}`);
  }
  return pendingChangeMessages;
}

const getSelectionValue = (templateLibraries, selections, selectionRelationships, metadata, selection) => {
  if (!selection) {
    throw new Error('selection required in getSelectionValue');
  }
  const selectionTemplate = TemplateLibrariesHelper.getTemplateById(templateLibraries, selection.templateId);
  let selectionValue;
  let selectionValueSource = selection.valueSource;
  const variableCollectorSelection = getVariableCollectorSelection(templateLibraries, selections, selectionRelationships, selection);
  let variableCollectorSelectionVariableSet = false;
  // let expr;
  // let variableValues = {};
  // let allVariableValuesFound = true;
  let valueFormula;
  let variableToDisplay;
  let defaultValue;
  let selectionJsonVariableName;

  if (selectionTemplate) {
    selectionJsonVariableName = ItemTemplatesHelper.getJsonVariableName(selectionTemplate);
    if (selectionTemplate.templateType === Constants.templateTypes.lookupData) {
      //Just store the template id of the variable collector selection to help find it later
      selectionValue = variableCollectorSelection.templateId; // was template.name
      selectionValueSource = Constants.valueSources.lookupData;
    }
    else if (selectionTemplate.templateType === Constants.templateTypes.function) {
      selectionValue = applyFunctionOverChildrenOfParent(templateLibraries, selections, selectionRelationships, metadata, selection);
      selectionValueSource = Constants.valueSources.calculatedValue;
    }
    //Check for a custom lookup
    else if (selectionTemplate.customLookup) {
      selectionValue = '2345'; //getCustomValue(selection); // ToDo: port this
      selectionValueSource = Constants.valueSources.lookup;
    }
    //Check for valueFormula, which evaluates based on variables.
    else if (valueFormula = getSettingValue(selection,
      selectionTemplate, Constants.templateSettingKeys.valueFormula)) {
      const {formulaValue, allVariableValuesFound} = calculateFormulaValue(templateLibraries, selections, selectionRelationships,
          metadata, selection, valueFormula, selection);
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
    metadata, selection, selectionValue, selection.value, variableCollectorSelection,
    variableCollectorSelectionVariableSet, originalValueSource, selectionValueSource, selectionJsonVariableName);
  // //Store selectionValue in selection's value
  // const originalValue = selection.value;
  // const originalDisplayValue = getDisplayValue(templateLibraries, selections, selection);
  // if (selectionValue !== undefined
  //     && selectionValue !== null &&
  //     (variableCollectorSelectionVariableSet || selection.value !== selectionValue.toString())) {
  //   if (selection.value !== selectionValue.toString()) {
  //     selection.value = selectionValue.toString();
  //     // afterSettingValue(selection);
  //   }
  //
  //   // Make sure formulas that reference this selection's variable get updated
  //   if (selectionJsonVariableName && variableCollectorSelection) {
  //     refreshSelectionsReferencingVariable(templateLibraries, selections, selectionRelationships,
  //       metadata, variableCollectorSelection, selectionJsonVariableName);
  //   }
  // }
  //
  // const currentDisplayValue = getDisplayValue(templateLibraries, selections, selection);
  // let displayMessages = getPendingChangeMessagesByOriginalAndCurrentInfo(originalValue, originalDisplayValue,
  //   originalValueSource, selection.value, currentDisplayValue, selectionValueSource);
  // if (displayMessages.length > 0) {
  //   if (!metadata.pendingSelectionChanges[selection._id]) {
  //     metadata.pendingSelectionChanges[selection._id] = {
  //       originalValue,
  //       originalDisplayValue,
  //       originalValueSource,
  //       displayMessages
  //     };
  //   } else {
  //     // Get displayMessages using the truly original values (current original ones represent altered values).
  //     displayMessages = getPendingChangeMessagesByOriginalAndCurrentInfo(
  //       metadata.pendingSelectionChanges[selection._id].originalValue,
  //       metadata.pendingSelectionChanges[selection._id].originalDisplayValue,
  //       metadata.pendingSelectionChanges[selection._id].originalValueSource,
  //       selection.value, currentDisplayValue, selectionValueSource);
  //     metadata.pendingSelectionChanges[selection._id].displayMessages = displayMessages;
  //   }
  // }

  return selectionValue;
};

const initializeValueToUse = (templateLibraries, selections, selectionRelationships, metadata, selection) => {
  if (!selection) {
    return;
  }

  const childSelections = getChildSelections(selection, selections, selectionRelationships);
  _.each(childSelections, (childSelection) => {
    initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, childSelection);
  });

  //Calling getSelectionValue() causes checks for undefined variables.
  getSelectionValue(templateLibraries, selections, selectionRelationships, metadata, selection);
};

const refreshValueToUse = (templateLibraries, selections, selectionRelationships, metadata, selection) => {
  if (selection) {
    const childSelections = getChildSelections(selection, selections, selectionRelationships);
    _.each(childSelections, (childSelection) => {
      refreshValueToUse(templateLibraries, selections, selectionRelationships, metadata, childSelection);
    });

    // Make sure formulas that reference selection's variable get updated
    if (metadata.selectionIdsReferencingVariables[selection._id]) {
      _.each(metadata.selectionIdsReferencingVariables[selection._id].selectionIds, (selectionId) => {
        const selectionReferencingVariable = _.find(selections, (_selection) => _selection._id === selectionId);
        if (selectionReferencingVariable) {
          getSelectionValue(templateLibraries, selections, selectionRelationships, metadata, selectionReferencingVariable);
        }
      });
    }
  }
};

// const populateVariablesUndefined = (selection, variablesUndefined) => {
//     if (selection && selection.variablesUndefined) {
//         selection.variablesUndefined.forEach(function (jsonVariableName) {
//             if ($.inArray(jsonVariableName, variablesUndefined) == -1) {
//                 variablesUndefined.push(jsonVariableName);
//             }
//         });
//     }
//
//     var childSelections = getSelectionsBySelectionParent(selection);
//
//     for (var i = 0; i < childSelections.length; i += 1) {
//         populateVariablesUndefined(childSelections[i], variablesUndefined);
//     }
// };
//
// const getAllVariablesUndefined = (selection) => {
//   let variablesUndefined = [];
//
//   populateVariablesUndefined(selection, variablesUndefined);
//
//   return variablesUndefined;
// };

const initializeMetadata = (metadata) => {
  // columnSelections should be like
  // {
  //   wHHJKRr2MhLdc4GkT: // productSelectionId
  //   [
  //     'jbexwHHJKRr2MhLdc', ... // id of column selection
  //   ]
  // }
  metadata.columnSelections = {};

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
};

const getInitializedMetadata = () => {
  let metadata = {};
  initializeMetadata(metadata);
  return metadata;
};

const initializeSelectionVariables = (templateLibraries, selections, selectionRelationships, metadata) => {
  initializeMetadata(metadata);

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

  initializeValueToUse(templateLibraries, selections, selectionRelationships, metadata, companySelection);

  // metadata.variablesUndefined = getAllVariablesUndefined(companySelection);

  //If any dependent variables are undefined, then something must be wrong.
  if (metadata.variablesUndefined.length > 0) {
      throw new Error('Variables not defined:' + variablesUndefined.join(","));
  }

  refreshValueToUse(templateLibraries, selections, selectionRelationships, metadata, companySelection);
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
    selectionRelationships, metadata, selection, selectionValue, oldValue, variableCollectorSelection,
    variableCollectorSelectionVariableSet, originalValueSource, selectionValueSource, selectionJsonVariableName) => {
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
        metadata, variableCollectorSelection, selectionJsonVariableName);
    }
  }

  const currentDisplayValue = getDisplayValue(templateLibraries, selections, selection);
  let displayMessages = getPendingChangeMessagesByOriginalAndCurrentInfo(originalValue, originalDisplayValue,
    originalValueSource, selection.value, currentDisplayValue, selectionValueSource);
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
        selection.value, currentDisplayValue, selectionValueSource);
      metadata.pendingSelectionChanges[selection._id].displayMessages = displayMessages;
    }
  }
}

const setSelectionValue = (templateLibraries, selections, selectionRelationships,
    metadata, selection, selectionValue, oldValue, originalValueSource, selectionValueSource) => {
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
      selectionRelationships, metadata, selection, selectionValue, oldValue, variableCollectorSelection,
      variableCollectorSelectionVariableSet, originalValueSource, selectionValueSource, jsonVariableName);
  }
}

SelectionsHelper = {
  applyFunctionOverChildrenOfParent: applyFunctionOverChildrenOfParent,
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
  getVariableCollectorSelection: getVariableCollectorSelection,
  initializeSelectionVariables: initializeSelectionVariables,
  setSelectionValue: setSelectionValue,
  sumSelections: sumSelections,
}
