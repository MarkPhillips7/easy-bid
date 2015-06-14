/*
 * Generate Test Companies, Users, roles
 */
//Confidential information stored in settings.*.json
Meteor.startup(function () {
  var systemAdminUserId;

  // Create a starting list of groups/companies (the name of these record will be used to identify the group with roles)
  var weMakeCabinets = {
    name: "We Make Cabinets",
    websiteUrl: "http://WeMakeCabinets.com",
    logoUrl: "http://we-make-cabinets.png"
  };
  var sheetMaterialRUs = {
    name: "Sheet Material R Us",
    websiteUrl: "http://sheetMaterialRUs.com",
    logoUrl: "http://sheet-material-r-us.png"
  };
  var companies = [weMakeCabinets, sheetMaterialRUs];

  //Confidential information stored in settings.*.json
  var markPhillips = {
    firstName: "Mark",
    lastName: "Phillips",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: ["system-admin"]
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
      roles: ["system-admin"]
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
      roles: ["user"]
    }, {
      group: "We Make Cabinets",
      roles: ["user", "manage-templates", "manage-users"]
    }],
    customerId: "cus_6J0QZsY1LoekyP",
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
      roles: ["user"]
    }, {
      group: "We Make Cabinets",
      roles: ["user"]
    }],
    customerId: "cus_6J0QZsY1LoekyP",
    subscription: {
      plan: {
        name: "proMonthly"//Eventually would be nice to have something like "proMonthlyCompanyPaid", And John cabinetmaker would be "proMonthly2User"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };''
  var bobCustomer =
  {
    firstName: "Bob",
    lastName: "Customer",
    email: "bob@anywhere.com",
    phoneNumber: "4345551212",
    notes: "Can also be reached at 123-456-7890",
    rolesByGroups: [{
      group: "We Make Cabinets",
      roles: ["customer"]
    }]
  };
//var guest =
//{
//  firstName: "Guest",
//  lastName: "",
//  roles: {role: "guest", Roles.GLOBAL_GROUP}
//};

  var roles = [
    "system-admin",//All-powerful user
    "manage-templates",//Can define variables and inputs
    "manage-users",//Manage subscriptions and make payments
    "user",//Create bids for customers
    "customer",//Customer that a bid was created for
    "guest"//a visitor to the website
  ];
//I think roles get added automatically so that this is not needed
//_.each(roles, function (role) {
//
//  roleId = Meteor.roles.findOne({role: role});
//  // If an existing role is not found, create the role.
//  if (!roleId) {
//
//    roleId = Meteor.roles.insert({
//      role: role
//    });
//  }
//
//}

  var users = [markPhillips, gregPhillips, johnCabinetmaker, henryCabinetmaker, bobCustomer];

  _.each(users, function (user) {
    var confidentialUserInfo = _.find(Meteor.settings.private.users, function (u) {
              return u.firstName === user.firstName && u.lastName === user.lastName;
            }) || {};
    var userEmail = user.email || confidentialUserInfo.email,
        userPassword = user.password || confidentialUserInfo.password || new Meteor.Collection.ObjectID().toString(),
        userPhoneNumber = user.phoneNumber || confidentialUserInfo.phoneNumber,
        userStripeCustomerId = user.customerId || confidentialUserInfo.customerId;

    var theUser = Meteor.users.findOne({"emails.address": userEmail});
    var userId = theUser && theUser._id;

    // If an existing user is not found, create the account.
    if (!userId) {

      userId = Accounts.createUser({
        email: userEmail,
        password: userPassword,
        profile: {
          name: user.firstName + " " + user.lastName
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

        Meteor.users.update(userId, {
          $set: {
            'profile.subscription': user.subscription,
            'profile.customerId': userStripeCustomerId,
            'profile.phoneNumber': userPhoneNumber,
            'profile.notes': user.notes
          }
        }, function (error, response) {
          if (error) {
            console.log(error);
          } else {
            console.log(user.firstName + " " + user.lastName + " was added as a user");
          }
        });
      }

    }

    if (user == markPhillips) {
        systemAdminUserId = userId;
    }
  });

  _.each(companies, function (company) {
    var companyId;

    companyId = Companies.findOne({"name": company.name});

    // If an existing company is not found, create it.
    if (!companyId) {

      companyId = Companies.insert({
        name: company.name,
        websiteUrl: company.websiteUrl,
        logoUrl: company.logoUrl,
        createdBy: systemAdminUserId
      });
    }
  });

});