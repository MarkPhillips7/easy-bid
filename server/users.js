Meteor.publish("coworkers", function (company) {
  check(company, Match.OneOf(String,null));
  return usersRelatedToCompany(this.userId,['manage-templates', 'manage-users', 'user'], company);
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

  if (!Roles.userIsInRole(loggedInUser, ['manage-users', 'system-admin'], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(loggedInUser, ['manage-templates', 'manage-users', 'user'], company)) {
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
//
//Meteor.publish("customers", function (company) {
//
//  if (!this.userId)
//    return null;
//
//  var loggedInUser = Meteor.users.findOne(this.userId);
//
//  if (!loggedInUser)
//    return null;
//
//  if (!Roles.userIsInRole(loggedInUser, ['manage-users', 'system-admin'], Roles.GLOBAL_GROUP)
//      && !Roles.userIsInRole(loggedInUser, ['manage-templates', 'manage-users', 'user'], company)) {
//    return null;
//  }
//
//  var customerIds = [];
//  Roles.getUsersInRole(['customer'], company)
//      .forEach(function(customer){
//        customerIds.push(customer._id);
//      });
//
//  return Meteor.users.find({
//    '_id' : { $in: customerIds }
//  }, {fields: {emails: 1, profile: 1}});
//});