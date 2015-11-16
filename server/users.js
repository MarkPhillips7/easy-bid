Meteor.publish("coworkers", function (companyId) {
  check(companyId, Match.OneOf(String,null));
  return usersRelatedToCompany(this.userId,[Config.roles.manageTemplates, Config.roles.manageUsers, Config.roles.user], companyId);
});

Meteor.publish("customers", function (companyId) {
  check(companyId, Match.OneOf(String,null));
  return usersRelatedToCompany(this.userId,[Config.roles.customer], companyId);
});

function usersRelatedToCompany(userId,roles, companyId) {
  check(userId, Match.OneOf(String,null));
  check(roles, [String]);
  check(companyId, Match.OneOf(String,null));

  if (!userId || !companyId)
    return null;

  var loggedInUser = Meteor.users.findOne(userId);

  if (!loggedInUser)
    return null;

  if (!Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers, Config.roles.systemAdmin], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(loggedInUser, [Config.roles.manageTemplates, Config.roles.manageUsers, Config.roles.user], companyId)) {
    return null;
  }

  var userIds = [];
  Roles.getUsersInRole(roles, companyId)
      .forEach(function(user){
        userIds.push(user._id);
  });

  return Meteor.users.find({
    '_id' : { $in: userIds }
  }, {fields: {emails: 1, profile: 1, roles: 1}});
}
