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
  }
});
