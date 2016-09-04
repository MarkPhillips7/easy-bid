var nextId = 1;//Used for creating unique ID values for HTML objects

const getSelectionsBySelectionParentAndTemplate = (templateLibraries, allSelections, selectionRelationships, template, productSelectionId) => {
  let selections = [];
  _.each(templateLibraries, (templateLibrary) => {
    selections = selections.concat(SelectionsHelper.getSelectionsBySelectionParentAndTemplate(
      templateLibrary, allSelections, selectionRelationships, productSelectionId, template));
  });
  return selections;
};

InputSelectionItem = function (templateLibraries, pendingChanges, template, productSelectionId, lookupData) {
  var inputSelectionItem = this;
  inputSelectionItem.id = nextId++;
  inputSelectionItem.template = template;
  inputSelectionItem.parentSelectionId = productSelectionId;
  inputSelectionItem.isDefinedAtThisLevel = false;
  const {job, metadata, selections: allSelections, selectionRelationships} = pendingChanges;

  inputSelectionItem.getSelection = function () {
    var selections = getSelectionsBySelectionParentAndTemplate(templateLibraries, allSelections, selectionRelationships, template, productSelectionId);
    if (selections && selections.length > 0) {
      return selections[0];
    }
    return null;
  }

  inputSelectionItem.reallyGetValue = function () {
    var selection = inputSelectionItem.getSelection();
    if (selection) {
      inputSelectionItem.isDefinedAtThisLevel = true;
      return selection.value;
    }
    const jsonVariableName = ItemTemplatesHelper.getJsonVariableName(template);
    if (jsonVariableName) {
      const productSelection = _.find(allSelections, (_selection) => _selection._id === productSelectionId);
      return SelectionsHelper.getJsonVariableValue(templateLibraries, allSelections, selectionRelationships, metadata,
        productSelection, jsonVariableName);
    }
    return null;
  }

  inputSelectionItem.reallySetValue = function (newValue) {
    if (newValue !== inputSelectionItem._value) {
      inputSelectionItem._value = newValue;
      const selection = inputSelectionItem.getSelection();
      if (selection) {
        if (template.templateType === Constants.templateTypes.specificationGroup) {
          SelectionsHelper.updateSpecificationGroupSelectionAndChildren(templateLibraries,
            pendingChanges, lookupData, selection, template, newValue, 0);
        } else {
          SelectionsHelper.setSelectionValue(templateLibraries, allSelections,
            selectionRelationships, metadata, lookupData, selection, newValue, selection.value,
            selection.valueSource, Constants.valueSources.userEntry);
        }
      } else {
        if (template.templateType === Constants.templateTypes.specificationGroup) {
          const parentSelection = _.find(allSelections, (_selection) => _selection._id === inputSelectionItem.parentSelectionId);
          SelectionsHelper.addSpecificationGroupSelectionAndChildren(templateLibraries,
            pendingChanges, lookupData, parentSelection, template, newValue, 0);
        } else {
          // maybe should just implement additional cases as they arise
          const templateLibrary = _.find(templateLibraries, (templateLibrary) =>
            _.some(templateLibrary.templates, (_template) => _template.id === template.id));
          SelectionsHelper.addSelectionForTemplate(templateLibrary, allSelections,
            selectionRelationships, metadata, job._id,
            template, newValue, inputSelectionItem.parentSelectionId, 0, lookupData);
        }
      }
    }
  }

  Object.defineProperty(inputSelectionItem, 'value', {
    get : function() {
      inputSelectionItem._value = inputSelectionItem.reallyGetValue();
      return inputSelectionItem._value;
    },
    set : function( value ) {
      inputSelectionItem.reallySetValue(value);
    }
  });

  // invoke value's get
  inputSelectionItem.value;
};

TabSection = function (title, templateLibraries, pendingChanges, template, productSelectionId, lookupData) {
  var tab = this;
  tab.title = title;
  tab.active = false;
  tab.disabled = false;
  tab.inputSelectionItems = [new InputSelectionItem(templateLibraries, pendingChanges, template, productSelectionId, lookupData)];
};
