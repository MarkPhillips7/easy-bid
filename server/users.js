Meteor.publish("coworkers", function (company) {
  check(company, Match.OneOf(String,null));
  return usersRelatedToCompany(this.userId,[Config.roles.manageTemplates, Config.roles.manageUsers, Config.roles.user], company);
});

Meteor.publish("customers", function (company) {
  check(company, Match.OneOf(String,null));
  return usersRelatedToCompany(this.userId,['customer'], company);
});

function usersRelatedToCompany(userId,roles, company) {
  check(userId, Match.OneOf(String,null));
  check(roles, [String]);
  check(company, Match.OneOf(String,null));

  if (!userId || !company)
    return null;

  var loggedInUser = Meteor.users.findOne(userId);

  if (!loggedInUser)
    return null;

  if (!Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers, Config.roles.systemAdmin], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(loggedInUser, [Config.roles.manageTemplates, Config.roles.manageUsers, Config.roles.user], company)) {
    return null;
  }

  var userIds = [];
  Roles.getUsersInRole(roles, company)
      .forEach(function(user){
        userIds.push(user._id);
  });

  return Meteor.users.find({
    '_id' : { $in: userIds }
  }, {fields: {emails: 1, profile: 1, roles: 1}});
}
