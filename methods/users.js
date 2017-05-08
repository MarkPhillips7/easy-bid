const userBelongsToTemplateLibrary = (userId, templateLibraryId) => {
  check(userId, String);
  check(templateLibraryId, String);

  const templateLibrary = TemplateLibraries.findOne(templateLibraryId);

  if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(userId, [Config.roles.user], templateLibrary.ownerCompanyId)) {
    return false;
  }

  return true;
};

const userCanInsertTemplateLibrary = (userId) => {
  check(userId, String);

  if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageTemplates], Roles.GLOBAL_GROUP))
    return false;
};

const userCanUpdateTemplateLibrary = (userId, templateLibraryId, onlyInsertingTemplates) => {
  check(userId, String);
  check(templateLibraryId, String);

  const templateLibrary = TemplateLibraries.findOne(templateLibraryId);

  if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageTemplates], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(userId, [Config.roles.manageTemplates], templateLibrary.ownerCompanyId)) {
    return false;
  }

  // inserting templates is safer than updating because inserting only affects future
  // bids while updating templates could impact calculations of existing bids.
  if (!onlyInsertingTemplates) {
    // ToDo: return false if templateLibrary isLocked (true after a bid has reached a certain status like Submitted)
  }

  return true;
};

Meteor.methods({
  userBelongsToTemplateLibrary,
  userCanInsertTemplateLibrary,
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
  userCanUpdateLookup: (userId, templateLibraryId) => {
    check(userId, String);
    check(templateLibraryId, String);

    return userBelongsToTemplateLibrary(userId, templateLibraryId);
  },
  userCanUpdateTemplateLibrary,
});
