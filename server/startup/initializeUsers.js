// Should be called by initializeEverything.js
/*
 * Generate Test Companies, Users, roles
 */
//Confidential information stored in settings.*.json
Initialization.initializeUsers = function (companyInfo) {
  var systemAdminUserId;

  //Confidential information stored in settings.*.json
  var markPhillips = {
    firstName: "Mark",
    lastName: "Phillips",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.systemAdmin]
    }],
    subscription: {
      plan: {
        name: "free"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  var gregPhillips =
  {
    firstName: "Greg",
    lastName: "Phillips",
    email: "Greg@EasyBid.com",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.systemAdmin]
    }],
    subscription: {
      plan: {
        name: "free"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  var johnCabinetmaker =
  {
    firstName: "John",
    lastName: "Cabinetmaker",
    email: "john@WeMakeCabinets.com",
    "password": "testTest",
    "phoneNumber": "4345551212",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.user]
    }, {
      group: companyInfo.weMakeCabinets._id,
      roles: [Config.roles.user, Config.roles.manageTemplates, Config.roles.manageUsers]
    }],
    stripeCustomerId: "cus_6J0QZsY1LoekyP",
    subscription: {
      plan: {
        name: "proMonthly"//Eventually would be nice to have something like "proMonthly2User" to also pay for Henry
      },
      payment: {
        card: {
          type: "Visa",
          lastFour: "1234"
        },
        nextPaymentDue: ( new Date() ).getTime()
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  var henryCabinetmaker =
  {
    firstName: "Henry",
    lastName: "Cabinetmaker",
    email: "henry@WeMakeCabinets.com",
    "password": "testTest",
    "phoneNumber": "4345551212",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.user]
    }, {
      group: companyInfo.weMakeCabinets._id,
      roles: [Config.roles.user]
    }],
    stripeCustomerId: "cus_6J0QZsY1LoekyP",
    subscription: {
      plan: {
        name: "proMonthly"//Eventually would be nice to have something like "proMonthlyCompanyPaid", And John cabinetmaker would be "proMonthly2User"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };

  var bobCustomer =
  {
    firstName: "Bob",
    lastName: "Customer",
    email: "bob@anywhere.com",
    phoneNumber: "4345551212",
    notes: "Can also be reached at 123-456-7890",
    rolesByGroups: [{
      group: companyInfo.weMakeCabinets._id,
      roles: [Config.roles.customer]
    }]
  };
//var guest =
//{
//  firstName: "Guest",
//  lastName: "",
//  roles: {role: "guest", Roles.GLOBAL_GROUP}
//};

  var users = [markPhillips, gregPhillips, johnCabinetmaker, henryCabinetmaker, bobCustomer];

  _.each(users, function (user) {
    var confidentialUserInfo = _.find(Meteor.settings.private.users, function (u) {
          return u.firstName === user.firstName && u.lastName === user.lastName;
        }) || {};
    var userEmail = user.email || confidentialUserInfo.email,
        userPassword = user.password || confidentialUserInfo.password || new Meteor.Collection.ObjectID().toString(),
        userPhoneNumber = user.phoneNumber || confidentialUserInfo.phoneNumber,
        userStripeCustomerId = user.stripeCustomerId || confidentialUserInfo.stripeCustomerId;

    var theUser = Accounts.findUserByEmail(userEmail);//Meteor.users.findOne("emails.address", userEmail);
    var userId = theUser && theUser._id;

    if(userId) {
      console.log('user found for ' + userEmail);
    }

    // If an existing user is not found, create the account.
    if (!userId) {

      console.log(user.firstName + " " + user.lastName + " about to be added");

      userId = Accounts.createUser({
        email: userEmail,
        password: userPassword,
        profile: {
          //name: user.firstName + " " + user.lastName
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          gender: user.gender,
          organization : user.organization,
          website: user.website,
          bio: user.bio,
          country: user.country,
          subscription: user.subscription,
          stripeCustomerId: userStripeCustomerId,
          phoneNumber: userPhoneNumber,
          notes: user.notes
        }
      });

      if (userId) {

        if (user.rolesByGroups.length > 0) {
          // Need _id of existing user record so this call must come
          // after `Accounts.createUser` or `Accounts.onCreate`
          _.each(user.rolesByGroups, function (roleInfo) {
            Roles.setUserRoles(userId, roleInfo.roles, roleInfo.group);
          });
        }
        console.log(user.firstName + " " + user.lastName + " was added as a user");
        //
        //Meteor.users.update(userId, {
        //  $set: {
        //    'profile.subscription': user.subscription,
        //    'profile.stripeCustomerId': userStripeCustomerId,
        //    'profile.phoneNumber': userPhoneNumber,
        //    'profile.notes': user.notes
        //  }
        //}, function (error, response) {
        //  if (error) {
        //    console.log(error);
        //  } else {
        //    console.log(user.firstName + " " + user.lastName + " was added as a user");
        //  }
        //});
      }

    }

    if (user == markPhillips) {
      systemAdminUserId = userId;
    }
  });

  return {
    systemAdminUserId: systemAdminUserId
  }
}