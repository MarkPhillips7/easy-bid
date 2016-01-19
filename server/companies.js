Meteor.publish("company", function (companyId) {
  check(companyId, Match.OneOf(String, null));
  return companyId && Companies.find({ _id: companyId });
});

Meteor.publish("companies", function(options, searchString) {
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!this.userId) {
    return null;
  }

  if (searchString == null) {
    searchString = '';
  }

  let loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser) {
    return null;
  }

  let selector;

  if (Roles.userIsInRole(loggedInUser, [
      Config.roles.manageUsers,
      Config.roles.systemAdmin
    ], Roles.GLOBAL_GROUP)) {
    selector = {
      name: {
        '$regex': '.*' + searchString || '' + '.*',
        '$options': 'i'
      }
    };
  } else {
    const companiesRelatedToUser = Roles.getGroupsForUser(loggedInUser);
    selector = {
      $and: [{
        'name': {
          '$regex': '.*' + searchString || '' + '.*',
          '$options': 'i'
        }
      }, {
        '_id': {
          $in: companiesRelatedToUser
        }
      }]
    }
  }

  Counts.publish(this, 'numberOfCompanies', Companies.find(selector), {
    noReady: true
  });

  return Companies.find(selector, options);
});
