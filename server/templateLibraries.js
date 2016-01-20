Meteor.publish("templateLibraries", function (options, searchString) {
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!this.userId)
    return null;

  if (searchString == null)
    searchString = '';

  var loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser)
    return null;

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
