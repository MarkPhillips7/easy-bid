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
      'ownerCompanyId' : { $in: companyIdsRelatedToUser }
    }]
  },{
    noReady: true
  }));

  return TemplateLibraries.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      'ownerCompanyId' : { $in: companyIdsRelatedToUser }
    }]
  },options);
});
