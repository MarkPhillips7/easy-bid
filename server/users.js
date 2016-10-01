Meteor.publish("coworkers", function(companyId, options, searchString) {
  check(companyId, Match.OneOf(String, null));
  check(searchString, Match.Any);

  const rolesToReturn = [
    Config.roles.manageTemplates,
    Config.roles.manageUsers,
    Config.roles.user
  ];

  return usersRelatedToCompany.bind(this)(this.userId, rolesToReturn, companyId,
    options, searchString, "numberOfCoworkers");
});

Meteor.publish("customers", function(companyId, options, searchString) {
  check(companyId, Match.OneOf(String, null));
  check(searchString, Match.Any);

  const rolesToReturn = [Config.roles.customer];

  return usersRelatedToCompany.bind(this)(this.userId, rolesToReturn, companyId,
    options, searchString, "numberOfCustomers");
});

Meteor.publish("user", function (userId) {
  check(userId, Match.OneOf(String, null));
  const options = {
    fields: {
      emails: 1,
      profile: 1,
      roles: 1
    }
  };
  return Meteor.users.find({ _id: userId }, options);
});

function usersRelatedToCompany(userId, rolesToReturn, companyId, options, searchString,
  countPublishName) {
  check(userId, Match.OneOf(String, null));
  check(rolesToReturn, [String]);
  check(companyId, Match.OneOf(String, null));
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!userId || !companyId) {
    return this.ready();
  }

  if (searchString == null) {
    searchString = '';
  }

  const loggedInUser = Meteor.users.findOne(userId);

    if (!loggedInUser) {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }

  if (!Roles.userIsInRole(loggedInUser, [
      Config.roles.manageUsers,
      Config.roles.systemAdmin
    ], Roles.GLOBAL_GROUP) &&
    !Roles.userIsInRole(loggedInUser, [
      Config.roles.manageTemplates,
      Config.roles.manageUsers,
      Config.roles.user
    ], companyId)) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  const userIds = [];
  Roles.getUsersInRole(rolesToReturn, companyId)
    .forEach(function(user) {
      userIds.push(user._id);
    });

  const selector = {
    '$or': [{
      'profile.firstName': {
        '$regex': '.*' + searchString || '' + '.*',
        '$options': 'i'
      }
    }, {
      'profile.lastName': {
        '$regex': '.*' + searchString || '' + '.*',
        '$options': 'i'
      }
    }],
    '_id': {
      $in: userIds
    }
  };

  const _options = Object.assign({}, options, {
    fields: {
      emails: 1,
      profile: 1,
      roles: 1
    }
  });

  Counts.publish(this, countPublishName, Meteor.users.find(selector), {
    noReady: true
  });

  return Meteor.users.find(selector, _options);
}
