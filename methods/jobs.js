import {diff} from 'rus-diff';

// currently not being used but seemed like it might be useful
// const addOrUpdateSelectionSettings = (templateLibrary, selection, selectionSettingsToAddOrUpdate) => {
//   let newSelectionSettings = selection.selectionSettings || [];
//   if (selectionSettingsToAddOrUpdate) {
//     _.each(selectionSettingsToAddOrUpdate, (selectionSettingToAddOrUpdate) => {
//       let existingSelectionSetting = _.find(newSelectionSettings, (selectionSetting) => {
//         return selectionSetting.key === selectionSettingToAddOrUpdate.key;
//       });
//
//       if (existingSelectionSetting) {
//         existingSelectionSetting.value = selectionSettingToAddOrUpdate.value;
//       } else {
//         newSelectionSettings.push(selectionSettingToAddOrUpdate);
//       }
//     });
//   }
//   Selections.update(selection._id, {$set: {selectionSettings: newSelectionSettings}});
// }

// See also SelectionsHelper.addSelectionForTemplate
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

  const selectionId = Selections.insert(selection);
  selection._id = selectionId;

  if (parentSelectionId) {
    let selectionRelationship = {
      jobId: jobId,
      parentSelectionId: parentSelectionId,
      childSelectionId: selectionId,
      order: childOrder
    }
    SelectionRelationships.insert(selectionRelationship);
  }

  // ToDo: add selection settings?
  // SelectionsHelper.setSelectionValue(templateLibraries, selections,
  //   selectionRelationships, metadata, selection, newValue, oldValue,
  //   selection.valueSource, Constants.valueSources.userEntry);

  return selection;
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
  saveSelectionChanges: function (jobToSave, selectionsToSave, selectionRelationshipsToSave) {
    check(jobToSave, Schema.Job);
    check(selectionsToSave, [Schema.Selection]);
    check(selectionRelationshipsToSave, [Schema.SelectionRelationship]);

    const jobId = jobToSave._id;
    if (_.any(selectionsToSave, (selection) => selection.jobId !== jobId)) {
      throw new Meteor.Error('can-update-selections-for-only-specified-job', 'Sorry, can only update selections for specified job.');
    }
    if (!Meteor.call("userCanUpdateJob", this.userId, jobId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    const job = Jobs.findOne({_id: jobId});

    if (selectionsToSave.length > 0) {
      // In order to validate the changes must load template libraries and all selections and verify all selection values are allowed
      const jobsTemplateLibraries = JobsTemplateLibraries.find({ 'jobId' : jobId });
      const templateLibraryIds = _.map(jobsTemplateLibraries.fetch(), (jobTemplateLibrary) => jobTemplateLibrary.templateLibraryId);
      const templateLibraries = TemplateLibraries.find({
        _id: { $in: templateLibraryIds }
      }).fetch();
      const selections = Selections.find({ 'jobId' : jobId }).fetch();
      const selectionRelationships = SelectionRelationships.find({ 'jobId' : jobId }).fetch();

      let selectionsWithUpdates = selections;
      let selectionRelationshipsWithUpdates = selectionRelationships;
      let selectionUpdates = [];
      let selectionInserts = [];
      let selectionRelationshipInserts = [];
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
          const selectionRelationshipsToInsert = _.filter(selectionRelationshipsToSave, (relationship) => relationship.childSelectionId === selectionToSave._id);
          selectionRelationshipInserts = [...selectionRelationshipInserts, ...selectionRelationshipsToInsert];
          selectionRelationshipsWithUpdates = [...selectionRelationshipsWithUpdates, ...selectionRelationshipsToInsert];
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
      SelectionsHelper.initializeMetadata(metadata, true);
      SelectionsHelper.initializeSelectionVariables(templateLibraries, selectionsWithUpdates, selectionRelationshipsWithUpdates, metadata);

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
      // turns out that selectionIdXrefs is not needed because meteor uses _id if specified.
      // let selectionIdXrefs = {};
      _.each(selectionInserts, (selectionToInsert) => {
        Selections.insert(selectionToInsert);
        // const selectionId = Selections.insert(selectionToInsert);
        // selectionIdXrefs[selectionToInsert._id] = selectionId;
      });
      _.each(selectionRelationshipInserts, (selectionRelationshipToInsert) => {
        SelectionRelationships.insert(selectionRelationshipToInsert);
        // const selectionRelationshipToInsertReally = {
        //   parentSelectionId: selectionIdXrefs[selectionRelationshipToInsert.parentSelectionId] || selectionRelationshipToInsert.parentSelectionId,
        //   childSelectionId: selectionIdXrefs[selectionRelationshipToInsert.childSelectionId] || selectionRelationshipToInsert.childSelectionId,
        // }
        // SelectionRelationships.insert(selectionRelationshipToInsertReally);
      });
    }

    const jobMods = diff(job, jobToSave);
    if (jobMods) {
      Jobs.update({_id: jobToSave._id}, jobMods);
    }
  }
});
