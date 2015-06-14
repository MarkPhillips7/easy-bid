Meteor.publish("companies", function (options, searchString) {
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!this.userId)
    return null;

  if (searchString == null)
    searchString = '';

  var loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser)
      return null;

  if (Roles.userIsInRole(loggedInUser, ['manage-users', 'system-admin'], Roles.GLOBAL_GROUP)) {
    Counts.publish(this, 'numberOfCompanies', Companies.find({
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    },{
      noReady: true
    }));

    return Companies.find({
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, options);
  }

  var companiesRelatedToUser = Roles.getGroupsForUser(loggedInUser);

  //Add something like this for search
  //'name' : { '$regex' : '.*' + searchString || '' + '.*', '$options' : 'i' },

  Counts.publish(this, 'numberOfCompanies', Companies.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      'name' : { $in: companiesRelatedToUser }
    }]
  },{
    noReady: true
  }));

  return Companies.find({
    $and : [{
      'name': {'$regex': '.*' + searchString || '' + '.*', '$options': 'i'}
    }, {
      'name' : { $in: companiesRelatedToUser }
    }]
  },options);
});