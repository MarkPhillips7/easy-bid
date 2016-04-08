const addSelectionForTemplate = (templateLibrary, jobId, template,
    selectionValue, parentSelectionId, childOrder) => {
  check(templateLibrary, Match.Any);// Schema.TemplateLibrary);
  check(jobId, Match.Any);// String);
  check(template, Match.Any);// Schema.ItemTemplate);
  check(selectionValue, Match.Any);// Match.OneOf(String, null));
  check(parentSelectionId, Match.Any);// Schema.Selection);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  let selection = {
    jobId: jobId,
    templateLibraryId: templateLibrary._id,
    templateId: template.id,
    value: selectionValue || ''
  };

  let selectionId = Selections.insert(selection);
  selection._id = selectionId;

  if (parentSelectionId) {
    let selectionRelationship = {
      parentSelectionId: parentSelectionId,
      childSelectionId: selectionId,
      order: childOrder
    }
    SelectionRelationships.insert(selectionRelationship);
  }

  // ToDo: add selection settings?

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
        existingSelectionSetting.value = selectionSettingToAddOrUpdate.value;
      } else {
        newSelectionSettings.push(selectionSettingToAddOrUpdate);
      }
    });
  }
  Selections.update(selection._id, {$set: {selectionSettings: newSelectionSettings}});
}

const addSelectionsForChildTemplateRelationship = (templateLibrary, jobId, selection, template,
    selectionAddingMode, templateRelationship, templateToStopAt) => {
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
        let selectionToOverride = SelectionsHelper.getSelectionToOverride(templateLibrary, selection, variableToOverride, []);
        if (selectionToOverride) {
          addOrUpdateSelectionSettings(templateLibrary, selectionToOverride, [ { key: propertyToOverride, value: overrideValue } ]);
        }
      } else if (isASubTemplate) {
        //Don't do anything. Sub templates are now handled in ProductSelection case.
      } else if (isABaseTemplate) {
        //If template IsABaseTemplate then don't add selection for this template now, just add selections for all of
        //its child sub templates (and they will add this template's other children).
        addSelectionsForTemplateChildren(templateLibrary, jobId, selection, childTemplate, Constants.selectionAddingModes.onlySubTemplates, templateToStopAt);
      } else {
        // SelectionsHelper.getSelectionValue(templateLibraries[0], selections, selectionRelationships, metadata, selection) => {
        const defaultValue = ItemTemplatesHelper.getTemplateSettingValueForTemplate(childTemplate, Constants.templateSettingKeys.defaultValue);

        //Not a base template or a sub template, so no matter the adding mode should go back to handling everything
        addSelectionsForTemplateAndChildren(templateLibrary, jobId, childTemplate, defaultValue, selection, 0, Constants.selectionAddingModes.handleAnything, templateToStopAt);
      }
    }
  }
};

const addSelectionsForTemplateChildren = (templateLibrary, jobId, selection, template,
    selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt) => {
  if (selection && template)
  {
    //If a child template exists with the same type as templateToStopAt then just return.
    if (templateToStopAt &&
      _.find(TemplateLibrariesHelper.templateChildren(templateLibrary, template), (templateChild) => {return templateChild.templateType == templateToStopAt.templateType;})){
      return;
    }

    //Add selections for template children that are not SubItems (sub templates) first so that everything that might be overridden by sub template exists.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(templateLibrary, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem != Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(templateLibrary, jobId, selection, template, selectionAddingMode, templateRelationship);
      });

    //Now it's safe to add selections for template children that are SubItems.
    _.chain(TemplateLibrariesHelper.getChildTemplateRelationships(templateLibrary, template.id))
      .filter((templateRelationship) => {return templateRelationship.relationToItem == Constants.relationToItem.subItem;})
      .each((templateRelationship, index, list) => {
        addSelectionsForChildTemplateRelationship(templateLibrary, jobId, selection, template, selectionAddingMode, templateRelationship);
      });

    //Handle case where this is a sub template but also a parent of a sub template. So need to add the template children of the base template
    if (selectionAddingMode == Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates) {
      let isABaseTemplate = template.templateSettings
        && _.find(template.templateSettings, (templateSetting) => {
          return templateSetting.key === "IsABaseTemplate" && templateSetting.value === true.toString();
        });

      //To get here must be a sub template or base template, so go ahead and add selections for children
      addSelectionsForTemplateChildren(templateLibrary, jobId, selection, template, Constants.selectionAddingModes.ignoreSubTemplates);

      //If this template is not a base template then still need to add selections for children of parent template(s)
      if (!isABaseTemplate)
      {
        _.each(TemplateLibrariesHelper.parentTemplates(templateLibrary, template), (parentTemplate) => {
          addSelectionsForTemplateChildren(templateLibrary, jobId, selection, parentTemplate, Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates);
        });
      }
    }
  }
};

const addSelectionsForTemplateAndChildren = (templateLibrary, jobId, template, selectionValue, parentSelection, childOrder,
      selectionAddingMode=Constants.selectionAddingModes.handleAnything, templateToStopAt) => {
  let selection = addSelectionForTemplate(templateLibrary, jobId, template, selectionValue, parentSelection._id, childOrder);
  addSelectionsForTemplateChildren(templateLibrary, jobId, selection, template, selectionAddingMode, templateToStopAt);

  return selection;
};

const addSelectionChildrenOfProduct = (templateLibrary, jobId, subTemplateSelection,
    productTemplate) => {
  //Add the template children of the base template before the sub template children because they override some of these
  const parentTemplate =  TemplateLibrariesHelper.parentTemplate(templateLibrary, productTemplate);
  const isABaseTemplate = ItemTemplatesHelper.isABaseTemplate(parentTemplate);
  const isASubTemplate = ItemTemplatesHelper.isASubTemplate(parentTemplate);
  if (!isABaseTemplate && !isASubTemplate) {
    return;
  }

  addSelectionChildrenOfProduct(templateLibrary, jobId, subTemplateSelection, parentTemplate);

  addSelectionsForTemplateChildren(templateLibrary, jobId, subTemplateSelection,
      parentTemplate, Constants.selectionAddingModes.addBaseTemplateChildrenForSubTemplates);

  //Add selection and template children for productTemplate (sub template)
  const subTemplateSelectionTemplate =  TemplateLibrariesHelper.getTemplateById(templateLibrary, subTemplateSelection.templateId);
  addSelectionsForTemplateChildren(templateLibrary, jobId, subTemplateSelection,
      subTemplateSelectionTemplate, Constants.selectionAddingModes.ignoreSubTemplates);
};

const addProductSelectionAndChildren = (templateLibrary, jobId, parentSelection,
    productSelectionTemplate, productTemplate, childOrder) => {
  check(templateLibrary, Schema.TemplateLibrary);
  check(jobId, String);
  check(parentSelection, Schema.Selection);
  check(productSelectionTemplate, Schema.ItemTemplate);
  check(productTemplate, Schema.ItemTemplate);
  check(childOrder, Match.Any);// Match.OneOf(Number, null));

  //Add selection for productSelectionTemplate
  var productSelection = addSelectionsForTemplateAndChildren(templateLibrary, jobId,
      productSelectionTemplate, null, parentSelection, childOrder, Constants.selectionAddingModes.ignoreBaseTemplates);

  //Add selection for productTemplate (sub template) (will add template children for sub template after adding template children of base template)
  var subTemplateSelection = addSelectionForTemplate(templateLibrary, jobId,
      productTemplate, productTemplate.id, productSelection._id, 0);

  addSelectionChildrenOfProduct(templateLibrary, jobId, subTemplateSelection, productTemplate);

  return productSelection;
};

Meteor.methods({
  userCanUpdateJob: function (userId, job, fields, modifier) {
    check(userId, String);
    check(job, Match.Any);
    check(fields, Match.Any);
    check(modifier, Match.Any);

    if (_.isString(job)) {
      job = Jobs.findOne(job);
    }
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.user], job.companyId)) {
      return false;
    }

    return true;
  },
  userCanViewJob: function (userId, job) {
    check(userId, String);
    check(job, Match.Any);

    if (_.isString(job)) {
      job = Jobs.findOne(job);
    }
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.user], job.companyId)) {
      return false;
    }

    return true;
  },
  addSelectionForTemplate,
  addProductSelectionAndChildren,
  // Actually deletes selection, parent selection relationships (but not parent selection), child selection relationships,
  // and all descendent selections (children, grandchildren, etc.)
  deleteSelectionAndRelated: function (selection) {
    check(selection, Match.Any);// Schema.Selection);

    if (!Meteor.call("userCanUpdateJob", this.userId, selection.jobId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    let selectionIdsToDelete = [];
    let selectionRelationshipIdsToDelete = [];

    // First get the parent relationships to delete
    const parentRelationshipIds = SelectionRelationships
        .find({childSelectionId: selection._id})
        .fetch()
        .map((relationship) => relationship._id);
    selectionRelationshipIdsToDelete.push(parentRelationshipIds);

    addSelectionAndRelationshipIdsOfDescendents(
      selection._id,
      selectionIdsToDelete,
      selectionRelationshipIdsToDelete);
    Selections.remove({_id: {$in: selectionIdsToDelete}});
    SelectionRelationships.remove({_id: {$in: selectionRelationshipIdsToDelete}});

    function addSelectionAndRelationshipIdsOfDescendents(
    selectionId, selectionIds, selectionRelationshipIds) {
      selectionIds.push(selectionId);
      const childRelationships = SelectionRelationships
          .find({parentSelectionId: selectionId})
          .fetch();
      _.each(childRelationships, (relationship) => {
        selectionRelationshipIdsToDelete.push(relationship._id);
        addSelectionAndRelationshipIdsOfDescendents(
          relationship.childSelectionId, selectionIds, selectionRelationshipIds);
      });
    }
  },
  saveSelectionChanges: function (jobToSave, selectionsToSave) {
    check(jobToSave, Schema.Job);
    check(selectionsToSave, [Schema.Selection]);

    const jobId = jobToSave._id;
    if (_.any(selectionsToSave, (selection) => selection.jobId !== jobId)) {
      throw new Meteor.Error('can-update-selections-for-only-specified-job', 'Sorry, can only update selections for specified job.');
    }
    if (!Meteor.call("userCanUpdateJob", this.userId, jobId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    const job = Jobs.findOne({_id: jobId});

    const diff = Meteor.npmRequire('rus-diff').diff;
    if (selectionsToSave.length > 0) {
      // In order to validate the changes must load template libraries and all selections and verify all selection values are allowed
      const jobsTemplateLibraries = JobsTemplateLibraries.find({ 'jobId' : jobId });
      const templateLibraryIds = _.map(jobsTemplateLibraries.fetch(), (jobTemplateLibrary) => jobTemplateLibrary.templateLibraryId);
      const templateLibraries = TemplateLibraries.find({
        _id: { $in: templateLibraryIds }
      }).fetch();
      const selections = Selections.find({ 'jobId' : jobId }).fetch();
      const selectionIds = _.map(selections, (selection) => selection._id);
      const selectionRelationships = SelectionRelationships.find({
        $or:[
          {"childSelectionId": { $in: selectionIds } },
          {"parentSelectionId": { $in: selectionIds } }
        ]}).fetch();

      let selectionsWithUpdates = selections;
      let selectionUpdates = [];
      let selectionInserts = [];
      // Replace selections from database with pending selections to perform validation
      _.each(selectionsToSave, (selectionToSave) => {
        let selection;
        const indexOfSelection = selectionsWithUpdates.findIndex((_selection) => {
          selection = _selection;
          return _selection._id === selectionToSave._id;
        });
        if (indexOfSelection === -1) {
          selectionInserts = [...selectionInserts, selectionToSave];
          selectionsWithUpdates = [
            ...selectionsWithUpdates,
            selectionToSave
          ];
        } else {
          const selectionMods = diff(selection, selectionToSave);
          if (selectionMods) {
            const selectionUpdate = {
              _id: selectionToSave._id,
              mods: selectionMods
            };
            selectionUpdates = [...selectionUpdates, selectionUpdate];
            selectionsWithUpdates = [
              ...selectionsWithUpdates.slice(0, indexOfSelection),
              selectionToSave,
              ...selectionsWithUpdates.slice(indexOfSelection + 1)
            ];
          }
        }
      });
      let metadata = {};
      SelectionsHelper.initializeSelectionVariables(templateLibraries, selectionsWithUpdates, selectionRelationships, metadata);

      // The existence of pending changes with display messages means the changes are invalid
      const truePendingChanges = _.filter(metadata.pendingSelectionChanges, (pendingChange) => {
        return pendingChange.displayMessages.length > 0;
      });
      if (truePendingChanges.length > 0) {
        _.each(truePendingChanges, (pendingChange) => {
          _.each(pendingChange.displayMessages, (displayMessage) => {
            console.log(`inconsistent data pending change: ${displayMessage}`);
          });
        });
        throw new Meteor.Error('inconsistent-data-request', 'Sorry, the requested changes would cause inconsistent data.');
      }

      _.each(selectionUpdates, (selectionUpdate) => {
        Selections.update({_id: selectionUpdate._id}, selectionUpdate.mods);
      });
      _.each(selectionInserts, (selectionToInsert) => {
        Selections.insert(selectionToInsert);
      });
    }

    const jobMods = diff(job, jobToSave);
    if (jobMods) {
      Jobs.update({_id: jobToSave._id}, jobMods);
    }
  }
});
