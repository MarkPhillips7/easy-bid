Meteor.publish("templateLibraries", function (options, searchString) {
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!this.userId) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  if (searchString == null)
    searchString = '';

  const loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser) {
    throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
  }

  if (Roles.userIsInRole(loggedInUser, [Config.roles.manageTemplates, Config.roles.systemAdmin], Roles.GLOBAL_GROUP)) {
    Counts.publish(this, 'numberOfTemplateLibraries', TemplateLibraries.find({
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    },{
      noReady: true
    }));

    return TemplateLibraries.find({
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, options);
  }

  const groupsRelatedToUser = Roles.getGroupsForUser(loggedInUser);
  const companyIdsRelatedToUser = Companies.find({
    '_id' : { $in: groupsRelatedToUser }
  }, { fields: { 'name': 1 } }).map(function (company) {return company._id;});

  Counts.publish(this, 'numberOfTemplateLibraries', TemplateLibraries.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      $or: [{
        'ownerCompanyId' : null
      }, {
        'ownerCompanyId' : { $in: companyIdsRelatedToUser }
      }],
    }]
  },{
    noReady: true
  }));

  return TemplateLibraries.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      $or: [{
        'ownerCompanyId' : null
      }, {
        'ownerCompanyId' : { $in: companyIdsRelatedToUser }
      }]
    }]
  },options);
});

// Including "Data" in the name of the publication to indicate that
// multiple cursors are returned
Meteor.publish("templateLibraryData", function (jobId, options) {
  check(jobId, Match.OneOf(String, null));
  check(options, Match.Any);

  if (!this.userId) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  const loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser) {
    throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
  }

  let jobsTemplateLibraries;
  let templateLibraries;

  if (jobId === 'new') {
    const groupsRelatedToUser = Roles.getGroupsForUser(loggedInUser);
    const defaultTemplateLibraryIdsRelatedToUser = Companies.find({
      '_id' : { $in: groupsRelatedToUser }
    }, { fields: { 'defaultTemplateLibraryId': 1 } }).map(function (company) {return company.defaultTemplateLibraryId;});
    templateLibraries = TemplateLibraries.find({
      '_id' : defaultTemplateLibraryIdsRelatedToUser[0]
    });
    // this should never return any records
    jobsTemplateLibraries = JobsTemplateLibraries.find({ 'jobId' : jobId }, options);
  } else {
    if (!Meteor.call('userCanViewJob', this.userId, jobId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    jobsTemplateLibraries = JobsTemplateLibraries.find({ 'jobId' : jobId }, options);
    const templateLibraryIds = _.map(jobsTemplateLibraries.fetch(), (jobTemplateLibrary) => jobTemplateLibrary.templateLibraryId);
    templateLibraries = TemplateLibraries.find({
      _id: { $in: templateLibraryIds }
    });
  }
  return [
    jobsTemplateLibraries,
    templateLibraries,
  ];
});
