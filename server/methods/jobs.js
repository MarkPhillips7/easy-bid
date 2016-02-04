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
  addSelectionForTemplate: function(templateLibrary, jobId, template, selectionValue, parentSelection, childOrder) {
    check(templateLibrary, Match.Any);// Schema.TemplateLibrary);
    check(jobId, Match.Any);// String);
    check(template, Match.Any);// Schema.ItemTemplate);
    check(selectionValue, Match.Any);// Match.OneOf(String, null));
    check(parentSelection, Match.Any);// Schema.Selection);
    check(childOrder, Match.Any);// Match.OneOf(Number, null));

    let selection = {
      jobId: jobId,
      templateLibraryId: templateLibrary._id,
      templateId: template.id,
      value: selectionValue || ''
    };

    let selectionId = Selections.insert(selection);
    selection._id = selectionId;

    if (parentSelection) {
      let selectionRelationship = {
        parentSelectionId: parentSelection._id,
        childSelectionId: selectionId,
        order: childOrder
      }
      SelectionRelationships.insert(selectionRelationship);
    }

    // ToDo: add selection settings?

    return selection;
  },
  // addSelectionForTemplate: function(job, templateLibrary, template,
  //   selectionValue, parentSelectionId) {
  //   let selectionId = Selections.insert({
  //     value: selectionValue,
  //     jobId: job._id,
  //     templateLibraryId: templateLibrary._id,
  //     templateId: template.id,
  //     selectionSettings: null,
  //     isOverridingDefault: false
  //   });
  //
  //   if (parentSelection) {
  //     SelectionRelationships.insert({
  //       parentSelectionId: parentSelectionId,
  //       childSelectionId: selectionId,
  //       order: 0
  //     });
  //   }
  //
  //   return Selections.findOne(selectionId);
  // },
  // Actually deletes selection, parent selection relationships (but not parent selection), child selection relationships,
  // and all descendent selections (children, grandchildren, etc.)
  deleteSelectionAndRelated: function (selection) {
    check(selection, Match.Any);// Schema.Selection);

    if (Meteor.call("userCanUpdateJob", this.userId, selection.jobId)) {
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
    } else {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }
  }
});
