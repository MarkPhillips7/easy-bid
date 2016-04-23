// Including "Data" in the name of the publication to indicate that
// multiple cursors are returned
Meteor.publish("selectionData", function (jobId, options) {
  check(jobId, Match.OneOf(String, null));
  check(options, Match.Any);

  if (!this.userId) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  const loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser) {
    throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
  }

  if (!Meteor.call('userCanViewJob', this.userId, jobId)) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  const selections = Selections.find({ 'jobId' : jobId }, options);
  const selectionRelationships = SelectionRelationships.find({ 'jobId' : jobId });

  return [
    selections,
    selectionRelationships
  ];
});
//
// Meteor.publish("selectionRelationships", function (jobId, selectionIds, options) {
//   check(jobId, Match.OneOf(String, null));
//   check(selectionIds, Match.OneOf([String], null));
//   check(options, Match.Any);
//
//   if (!this.userId) {
//     throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
//   }
//
//   if (searchString == null)
//     searchString = '';
//
//   const loggedInUser = Meteor.users.findOne(this.userId);
//
//   if (!loggedInUser) {
//     throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
//   }
//
//   if (!Meteor.call('userCanViewJob', this.userId, jobId)) {
//     throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
//   }
//
//   return SelectionRelationships.find({
//     $or:[
//       {"childSelectionId": { $in: selectionIds } },
//       {"parentSelectionId": { $in: selectionIds } }
//     ]} ,options);
// });
