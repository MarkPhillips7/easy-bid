JobsTemplateLibraries = new Mongo.Collection("jobsTemplateLibraries");

Schema.JobTemplateLibrary = new SimpleSchema({
  jobId: {
    type: String
  },
  templateLibraryId: {
    type: String
  }
});

JobsTemplateLibraries.attachSchema(Schema.JobTemplateLibrary);

JobsTemplateLibraries.allow({
  insert: function (userId, job) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.user], job.companyId)) {
      return false;
    }

    return true;
  },
  update: function (userId, job, fields, modifier) {
    var company = _.find(vm.companies, function(company){ return company._id === companyId; });

    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.user], job.companyId)) {
      return false;
    }

    return true;
  },
  remove: function (userId, job) {
    return false;
  }
});

