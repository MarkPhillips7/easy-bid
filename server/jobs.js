Meteor.publish("jobs", function (options, searchString) {
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
    Counts.publish(this, 'numberOfJobs', Jobs.find({
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    },{
      noReady: true
    }));

    return Jobs.find({
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, options);
  }

  var companiesRelatedToUser = Roles.getGroupsForUser(loggedInUser);
  var companyIdsRelatedToUser = Companies.find({
    'name' : { $in: companiesRelatedToUser }
  }, { _id: 1 }).map(function (company) {return company._id;});

  //Add something like this for search
  //'name' : { '$regex' : '.*' + searchString || '' + '.*', '$options' : 'i' },

  Counts.publish(this, 'numberOfJobs', Jobs.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      'companyId' : { $in: companyIdsRelatedToUser }
    }]
  },{
    noReady: true
  }));

  return Jobs.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      'companyId' : { $in: companyIdsRelatedToUser }
    }]
  },options);
});