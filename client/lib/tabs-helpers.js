var nextId = 1;//Used for creating unique ID values for HTML objects

const getSelectionsBySelectionParentAndTemplate = (templateLibraries, allSelections, selectionRelationships, template, productSelectionId) => {
  let selections = [];
  _.each(templateLibraries, (templateLibrary) => {
    selections = selections.concat(SelectionsHelper.getSelectionsBySelectionParentAndTemplate(
      templateLibrary, allSelections, selectionRelationships, productSelectionId, template));
  });
  return selections;
};

InputSelectionItem = function (templateLibraries, allSelections, selectionRelationships, template, productSelectionId, metadata) {
  var inputSelectionItem = this;
  inputSelectionItem.id = nextId++;
  inputSelectionItem.template = template;
  inputSelectionItem.parentSelectionId = productSelectionId;
  inputSelectionItem.value = undefined;
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
  inputSelectionItem.getValue = function () {
    inputSelectionItem.value = inputSelectionItem.reallyGetValue();
    return inputSelectionItem.value;
  }
  inputSelectionItem.getValue();
};

TabSection = function (title, templateLibraries, selections, selectionRelationships, template, productSelectionId, metadata) {
  var tab = this;
  tab.title = title;
  tab.active = false;
  tab.disabled = false;
  tab.inputSelectionItems = [new InputSelectionItem(templateLibraries, selections, selectionRelationships, template, productSelectionId, metadata)];
};
