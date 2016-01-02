Meteor.methods({
  userCanUpdateJob: function (job, fields, modifier) {
    var userId = Meteor.userId();
    if (_.isString(job)) {
      job = Jobs.findOne(job);
    }
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.user], job.companyId)) {
      return false;
    }

    return true;
  }
});