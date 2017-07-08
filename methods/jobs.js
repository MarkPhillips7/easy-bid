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
// const addSelectionForTemplate = (templateLibrary, jobId, template,
//     selectionValue, parentSelectionId, childOrder) => {
//   check(templateLibrary, Match.Any);// Schema.TemplateLibrary);
//   check(jobId, Match.Any);// String);
//   check(template, Match.Any);// Schema.ItemTemplate);
//   check(selectionValue, Match.Any);// Match.OneOf(String, null));
//   check(parentSelectionId, Match.Any);// Schema.Selection);
//   check(childOrder, Match.Any);// Match.OneOf(Number, null));
//
//   let selection = {
//     jobId: jobId,
//     templateLibraryId: templateLibrary._id,
//     templateId: template.id,
//     value: selectionValue || ''
//   };
//
//   const selectionId = Selections.insert(selection);
//   selection._id = selectionId;
//
//   if (parentSelectionId) {
//     let selectionRelationship = {
//       jobId: jobId,
//       parentSelectionId: parentSelectionId,
//       childSelectionId: selectionId,
//       order: childOrder
//     }
//     SelectionRelationships.insert(selectionRelationship);
//   }

  // ToDo: add selection settings?
  // SelectionsHelper.setSelectionValue(templateLibraries, selections,
  //   selectionRelationships, metadata, selection, newValue, oldValue,
  //   selection.valueSource, Constants.valueSources.userEntry);
//
//   return selection;
// };

Meteor.methods({
  // addSelectionForTemplate,
  // Actually deletes selection, parent selection relationships (but not parent selection), child selection relationships,
  // and all descendent selections (children, grandchildren, etc.)
  // deleteSelectionAndRelated: function (selection) {
  //   check(selection, Match.Any);// Schema.Selection);
  //
  //   if (!Meteor.call("userCanUpdateJob", this.userId, selection.jobId)) {
  //     throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  //   }
  //
  //   let selectionIdsToDelete = [];
  //   let selectionRelationshipIdsToDelete = [];
  //
  //   // First get the parent relationships to delete
  //   const parentRelationshipIds = SelectionRelationships
  //       .find({childSelectionId: selection._id})
  //       .fetch()
  //       .map((relationship) => relationship._id);
  //   selectionRelationshipIdsToDelete.push(parentRelationshipIds);
  //
  //   addSelectionAndRelationshipIdsOfDescendents(
  //     selection._id,
  //     selectionIdsToDelete,
  //     selectionRelationshipIdsToDelete);
  //   Selections.remove({_id: {$in: selectionIdsToDelete}});
  //   SelectionRelationships.remove({_id: {$in: selectionRelationshipIdsToDelete}});
  //
  //   function addSelectionAndRelationshipIdsOfDescendents(
  //   selectionId, selectionIds, selectionRelationshipIds) {
  //     selectionIds.push(selectionId);
  //     const childRelationships = SelectionRelationships
  //         .find({parentSelectionId: selectionId})
  //         .fetch();
  //     _.each(childRelationships, (relationship) => {
  //       selectionRelationshipIdsToDelete.push(relationship._id);
  //       addSelectionAndRelationshipIdsOfDescendents(
  //         relationship.childSelectionId, selectionIds, selectionRelationshipIds);
  //     });
  //   }
  // },
  saveSelectionChanges: function (templateLibrariesIfNew, jobToSave, selectionsToSave, selectionIdsToDelete,
      selectionRelationshipsToSave, selectionRelationshipIdsToDelete, lookupData, isInsert) {
    check(templateLibrariesIfNew, Match.Any);
    check(selectionsToSave, [Schema.Selection]);
    check(selectionIdsToDelete, [String]);
    check(selectionRelationshipsToSave, [Schema.SelectionRelationship]);
    check(selectionRelationshipIdsToDelete, [String]);
    check(lookupData, Match.Any);
    check(isInsert, Boolean);
    // Clean jobToSave on server to add autovalue fields.
    if (Meteor.isServer) {
      // extendAutoValueContext needed because of https://github.com/aldeed/meteor-simple-schema/issues/530
      Schema.Job.clean(jobToSave, { extendAutoValueContext: { isUpdate: !isInsert, isInsert }});
      check(jobToSave, Schema.Job);
    }

    let anyMods = false;
    const jobId = jobToSave._id;
    if (_.any(selectionsToSave, (selection) => selection.jobId !== jobId)) {
      throw new Meteor.Error('can-update-selections-for-only-specified-job', 'Sorry, can only update selections for specified job.');
    }
    if (!Meteor.call("userCanUpdateJob", this.userId, jobId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    const job = Jobs.findOne({_id: jobId});
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

    if (selectionIdsToDelete && selectionIdsToDelete.length > 0) {
      selectionsWithUpdates = _.filter(selections, (selection) => !_.contains(selectionIdsToDelete, selection._id));
    }
    if (selectionRelationshipIdsToDelete && selectionRelationshipIdsToDelete.length > 0) {
      selectionRelationshipsWithUpdates = _.filter(selectionRelationships,
        (relationship) => !_.contains(selectionRelationshipIdsToDelete, relationship._id));
    }
    if (selectionsToSave.length > 0) {
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
      const pendingChanges = {
        job: jobToSave,
        lookupData,
        metadata,
        selections: selectionsWithUpdates,
        selectionRelationships: selectionRelationshipsWithUpdates,
        templateLibraries,
      }
      SelectionsHelper.initializeSelectionVariables(pendingChanges);

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
        anyMods = true;
      });
      // turns out that selectionIdXrefs is not needed because meteor uses _id if specified.
      // let selectionIdXrefs = {};
      _.each(selectionInserts, (selectionToInsert) => {
        Selections.insert(selectionToInsert);
        anyMods = true;
        // const selectionId = Selections.insert(selectionToInsert);
        // selectionIdXrefs[selectionToInsert._id] = selectionId;
      });
      _.each(selectionRelationshipInserts, (selectionRelationshipToInsert) => {
        SelectionRelationships.insert(selectionRelationshipToInsert);
        anyMods = true;
        // const selectionRelationshipToInsertReally = {
        //   parentSelectionId: selectionIdXrefs[selectionRelationshipToInsert.parentSelectionId] || selectionRelationshipToInsert.parentSelectionId,
        //   childSelectionId: selectionIdXrefs[selectionRelationshipToInsert.childSelectionId] || selectionRelationshipToInsert.childSelectionId,
        // }
        // SelectionRelationships.insert(selectionRelationshipToInsertReally);
      });
    }
    if (selectionIdsToDelete && selectionIdsToDelete.length > 0) {
      Selections.remove({_id: {$in: selectionIdsToDelete}});
      anyMods = true;
    }
    if (selectionRelationshipIdsToDelete && selectionRelationshipIdsToDelete.length > 0) {
      SelectionRelationships.remove({_id: {$in: selectionRelationshipIdsToDelete}});
      anyMods = true;
    }
    if (job) {
      if (anyMods || diff(job, jobToSave)) {
        jobToSave.modifiedAt = new Date();
        jobToSave.modifiedBy = Meteor.userId();
        const jobMods = diff(job, jobToSave);
        Jobs.update({_id: jobToSave._id}, jobMods);
      }
    } else {
      const now = new Date();
      jobToSave.createdAt = new Date();
      jobToSave.createdBy = Meteor.userId();
      jobToSave.modifiedAt = new Date();
      jobToSave.modifiedBy = Meteor.userId();
      Jobs.insert(jobToSave);
      _.each(templateLibrariesIfNew, (templateLibrary) => {
        JobsTemplateLibraries.insert({
          jobId: jobToSave._id,
          templateLibraryId: templateLibrary._id,
        });
      })
    }
  }
});
