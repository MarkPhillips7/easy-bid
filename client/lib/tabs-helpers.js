var nextId = 1;//Used for creating unique ID values for HTML objects

const getSelectionsBySelectionParentAndTemplate = (templateLibraries, allSelections, selectionRelationships, template, productSelection) => {
  let selections = [];
  _.each(templateLibraries, (templateLibrary) => {
    selections = selections.concat(SelectionsHelper.getSelectionsBySelectionParentAndTemplate(
      templateLibrary, allSelections, selectionRelationships, productSelection, template));
  });
  return selections;
};

InputSelectionItem = function (templateLibraries, allSelections, selectionRelationships, template, productSelection) {
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
};

TabSection = function (title, templateLibraries, selections, selectionRelationships, template, productSelection) {
  var tab = this;
  tab.title = title;
  tab.active = false;
  tab.disabled = false;
  tab.inputSelectionItems = [new InputSelectionItem(templateLibraries, selections, selectionRelationships, template, productSelection)];
};
