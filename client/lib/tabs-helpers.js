var nextId = 1;//Used for creating unique ID values for HTML objects

InputSelectionItem = function (bidControllerData, template, productSelectionId) {
  var inputSelectionItem = this;
  inputSelectionItem.id = nextId++;
  inputSelectionItem.template = template;
  inputSelectionItem.parentSelectionId = productSelectionId;
  inputSelectionItem.isDefinedAtThisLevel = false;
  const {selections} = bidControllerData;

  inputSelectionItem.getSelection = function () {
    const selectionCandidates = SelectionsHelper.getSelectionsBySelectionParentAndTemplate(bidControllerData, productSelectionId, template);
    if (selectionCandidates && selectionCandidates.length > 0) {
      return selectionCandidates[0];
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
      const productSelection = _.find(selections, (_selection) => _selection._id === productSelectionId);
      return SelectionsHelper.getJsonVariableValue(bidControllerData, productSelection, jsonVariableName);
    }
    return null;
  }

  inputSelectionItem.reallySetValue = function (newValue) {
    if (newValue !== inputSelectionItem._value) {
      inputSelectionItem._value = newValue;
      const selection = inputSelectionItem.getSelection();
      if (selection) {
        if (template.templateType === Constants.templateTypes.specificationGroup) {
          SelectionsHelper.updateSpecificationGroupSelectionAndChildren(bidControllerData, selection, template, newValue, 0);
        } else {
          SelectionsHelper.setSelectionValue(bidControllerData, selection, newValue, selection.value,
            selection.valueSource, Constants.valueSources.userEntry);
        }
      } else {
        if (template.templateType === Constants.templateTypes.specificationGroup) {
          const parentSelection = _.find(selections, (_selection) => _selection._id === inputSelectionItem.parentSelectionId);
          SelectionsHelper.addSpecificationGroupSelectionAndChildren(bidControllerData, parentSelection, template, newValue, 0);
        } else {
          // maybe should just implement additional cases as they arise
          SelectionsHelper.addSelectionForTemplate(bidControllerData, template, newValue, inputSelectionItem.parentSelectionId, 0);
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

TabSection = function (title, bidControllerData, template, productSelectionId) {
  var tab = this;
  tab.title = title;
  tab.active = false;
  tab.disabled = false;
  tab.inputSelectionItems = [new InputSelectionItem(bidControllerData, template, productSelectionId)];
};
