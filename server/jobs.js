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

  var companiesRelatedToUser = Meteor.call('companyIdsRelatedToUser', loggedInUser);

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
