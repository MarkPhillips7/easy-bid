var nextId = 1;//Used for creating unique ID values for HTML objects

const getSelectionsBySelectionParentAndTemplate = (templateLibraries, allSelections, selectionRelationships, template, productSelection) => {
  let selections = [];
  _.each(templateLibraries, (templateLibrary) => {
    selections = selections.concat(SelectionsHelper.getSelectionsBySelectionParentAndTemplate(
      templateLibrary, allSelections, selectionRelationships, productSelection, template));
  });
  return selections;
};

InputSelectionItem = function (templateLibraries, allSelections, selectionRelationships, template, productSelection, metadata) {
  var inputSelectionItem = this;
  inputSelectionItem.id = nextId++;
  inputSelectionItem.template = template;
  inputSelectionItem.getSelection = function () {
    var selections = getSelectionsBySelectionParentAndTemplate(templateLibraries, allSelections, selectionRelationships, template, productSelection);
    if (selections && selections.length > 0) {
      return selections[0];
    }
    return null;
  }
  inputSelectionItem.getValue = function () {
    var selection = inputSelectionItem.getSelection();
    if (selection) {
      return selection.value;
    }
    const jsonVariableName = ItemTemplatesHelper.getJsonVariableName(template);
    if (jsonVariableName) {
      return SelectionsHelper.getJsonVariableValue(templateLibraries, allSelections, selectionRelationships, metadata,
        productSelection, jsonVariableName);
    }
    return null;
  }
};

TabSection = function (title, templateLibraries, selections, selectionRelationships, template, productSelection, metadata) {
  var tab = this;
  tab.title = title;
  tab.active = false;
  tab.disabled = false;
  tab.inputSelectionItems = [new InputSelectionItem(templateLibraries, selections, selectionRelationships, template, productSelection, metadata)];
};
