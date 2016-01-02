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
  value: {
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

function childSelections(selection) {
  if (!selection) {
    throw 'selection must be set in childSelections';
  }

  let childSelectionIds = SelectionRelationships.find({parentSelectionId: selection._id})
    .map(function(relationship){
      return relationship.childSelectionId;
    });
  return Selections.find({_id: { $in: childSelectionIds } }).fetch();
}

function parentSelections(selection) {
  if (!selection) {
    throw 'selection must be set in parentSelections';
  }

  let parentSelectionIds = SelectionRelationships.find({childSelectionId: selection._id})
    .map(function(relationship){
      return relationship.parentSelectionId;
    });
  return Selections.find({_id: { $in: parentSelectionIds } }).fetch();
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
    let childSelections = SelectionsHelper.childSelections(selection);
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
    let parentSelections = SelectionsHelper.parentSelections(selection);
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

SelectionsHelper = {
  getSelectionToOverride: getSelectionToOverride,
  childSelections: childSelections,
  parentSelections: parentSelections
}
