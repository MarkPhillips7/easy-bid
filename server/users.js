Meteor.publish("coworkers", function(companyId, searchString) {
  check(companyId, Match.OneOf(String, null));
  check(searchString, Match.Any);

  const roles = [
    Config.roles.manageTemplates,
    Config.roles.manageUsers,
    Config.roles.user
  ];

  return usersRelatedToCompany.bind(this)(this.userId, roles, companyId,
    searchString, "numberOfCoworkers");
});

Meteor.publish("customers", function(companyId, searchString) {
  check(companyId, Match.OneOf(String, null));
  check(searchString, Match.Any);

  const roles = [Config.roles.customer];

  return usersRelatedToCompany.bind(this)(this.userId, roles, companyId,
    searchString, "numberOfCustomers");
});

function usersRelatedToCompany(userId, roles, companyId, searchString,
  countPublishName) {
  check(userId, Match.OneOf(String, null));
  check(roles, [String]);
  check(companyId, Match.OneOf(String, null));
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!userId || !companyId)
    return null;

  if (searchString == null) {
    searchString = '';
  }

  let loggedInUser = Meteor.users.findOne(userId);

  if (!loggedInUser)
    return null;

  if (!Roles.userIsInRole(loggedInUser, [
      Config.roles.manageUsers,
      Config.roles.systemAdmin
    ], Roles.GLOBAL_GROUP) &&
    !Roles.userIsInRole(loggedInUser, [
      Config.roles.manageTemplates,
      Config.roles.manageUsers,
      Config.roles.user
    ], companyId)) {
    return null;
  }

  let userIds = [];
  Roles.getUsersInRole(roles, companyId)
    .forEach(function(user) {
      userIds.push(user._id);
    });

  let selector = {
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

  let options = {
    fields: {
      emails: 1,
      profile: 1,
      roles: 1
    }
  };

  Counts.publish(this, countPublishName, Meteor.users.find(selector), {
    noReady: true
  });

  return Meteor.users.find(selector, options);
}
