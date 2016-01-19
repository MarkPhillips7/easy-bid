Meteor.methods({
  createUserRelatedToCompany: function(user, companyId) {
    // user like Schema.User but not entirely, so...
    check(user, {
      emailAddress: String,
      firstName: String,
      lastName: String,
      address: Match.Optional({
        addressLines: String,
        city: String,
        state: String,
        zipCode: String,
      }),
      gender: Match.Optional(String),
      organization : Match.Optional(String),
      website: Match.Optional(String),
      bio: Match.Optional(String),
      country: Match.Optional(String),
      subscription: Match.Optional(String),
      stripeCustomerId: Match.Optional(String),
      phoneNumber: Match.Optional(String),
      notes: Match.Optional(String)
    });
    check(companyId, String);

    let loggedInUser = Meteor.userId();
    if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers, Config.roles.user], companyId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    const newId = new Meteor.Collection.ObjectID().toString();
    let userEmail = user.emailAddress || `${Constants.noEmailYet}@${newId}.com`;
    let userPassword = user.password || new Meteor.Collection.ObjectID().toString();

    console.log(`About to call findUserByEmail(${userEmail})`);

    var theUser = Accounts.findUserByEmail(userEmail);
    var userId = theUser && theUser._id;

    if(userId) {
      throw new Meteor.Error('user-exists', 'Sorry, that user email already exists!');
    }

    console.log(user.firstName + " " + user.lastName + " about to be added");

    userId = Accounts.createUser
    (
      {
        email: userEmail,
        password: userPassword,
        profile: {
          nameLower: user.firstName.toLowerCase() + " " + user.lastName.toLowerCase(),
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          gender: user.gender,
          organization : user.organization,
          website: user.website,
          bio: user.bio,
          country: user.country,
          subscription: user.subscription,
          stripeCustomerId: user.stripeCustomerId,
          phoneNumber: user.phoneNumber,
          notes: user.notes
        }
      }
    );

    console.log(user.firstName + " " + user.lastName + " was added as a user");

    return userId;
  },
  updateUserRelatedToCompany: function(user, companyId) {
    // user like Schema.User but not entirely, so...
    check(user, {
      emailAddress: String,
      firstName: String,
      lastName: String,
      address: Match.Optional({
        addressLines: String,
        city: String,
        state: String,
        zipCode: String,
      }),
      gender: Match.Optional(String),
      organization : Match.Optional(String),
      website: Match.Optional(String),
      bio: Match.Optional(String),
      country: Match.Optional(String),
      subscription: Match.Optional(String),
      stripeCustomerId: Match.Optional(String),
      phoneNumber: Match.Optional(String),
      notes: Match.Optional(String)
    });
    check(companyId, String);

    let loggedInUser = Meteor.userId();
    if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
    && !Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers, Config.roles.user], companyId)) {
      throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
    }

    console.log(`About to call findUserByEmail(${user.emailAddress})`);

    var theUser = Accounts.findUserByEmail(user.emailAddress);
    var userId = theUser && theUser._id;

    if(!userId) {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }

    console.log(user.firstName + " " + user.lastName + " about to be updated");
    Meteor.users.update(userId, {
      $set: {
        'profile.firstName': user.firstName,
        'profile.lastName': user.lastName,
        'profile.address': user.address,
        'profile.gender': user.gender,
        'profile.organization': user.organization,
        'profile.website': user.website,
        'profile.bio': user.bio,
        'profile.country': user.country,
        'profile.subscription': user.subscription,
        'profile.stripeCustomerId': user.stripeCustomerId,
        'profile.phoneNumber': user.phoneNumber,
        'profile.notes': user.notes
      }
    });

    console.log(user.firstName + " " + user.lastName + " profile was updated");

    return userId;
  },
  addUserRole: function (userId, role, companyId) {
    check(userId, String);
    check(role, String);
    check(companyId, String);

    let loggedInUser = Meteor.userId();

    switch (role) {
      case Config.roles.systemAdmin:
        if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin], Roles.GLOBAL_GROUP)) {
          throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
        }
        break;
      case Config.roles.manageUsers:
        if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
        && !Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers], companyId)) {
          throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
        }
        break;
      case Config.roles.user:
        if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
        && !Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers], companyId)) {
          throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
        }
        break;
      case Config.roles.customer:
        if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
        && !Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers, Config.roles.user], companyId)) {
          throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
        }
        break;
      case Config.roles.guest:
        if (!Roles.userIsInRole(loggedInUser, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
        && !Roles.userIsInRole(loggedInUser, [Config.roles.manageUsers, Config.roles.user], companyId)) {
          throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
        }
        break;
    }

    const user =  Meteor.users.findOne(userId);
    if (user) {
      let roles;
      const rolesForCompany = user.roles && user.roles[companyId];

      if (rolesForCompany) {
        if (_.some(rolesForCompany, function (_role) {
          return _role === role;
        })) {
          // user already has role, so just return
          console.log(`${user.profile.firstName} ${user.profile.lastName} already had ${role} role`);
          return;
        } else {
          roles = [ ...rolesForCompany, role];
        }
      }

      if (!roles) {
        roles = [role];
      }

      Roles.setUserRoles(userId, roles, companyId);
      console.log(`${user.profile.firstName} ${user.profile.lastName} was given ${role} role`);
    } else {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }
  },
  companyIdsRelatedToUser: function (user) {
    check(user, Match.OneOf(String, null));

    if (user) {
      let companiesRelatedToUser = Roles.getGroupsForUser(user);
      return Companies.find(
        {
          '_id' : { $in: companiesRelatedToUser }
        }, {
          _id: 1
        }
      ).map(function (company) {return company._id;});
    }

    return [];
  },
  checkUserPlan: function (user) {
    if (user == null){
      return false;
    }

    check(user, String);

    let getUser = Meteor.users.findOne({"_id": user}, {fields: {"profile.subscription": 1}});
    let subscription = getUser.profile.subscription;

    if (!subscription || !subscription.plan) {// || !currentPlan.amount){
      return false;
    }

    let availablePlans = Meteor.settings.public.plans;
    let currentPlan = _.find(availablePlans, function (plan) {
      return plan.name == subscription.plan.name;
    });
    let limit = currentPlan.limit;
    //let amount = currentPlan.amount.usd;

    if (subscription && limit) {
      let planData = {
        subscription: subscription,
        limit: limit, //,// > 1 ? limit + " lists" : limit + " list",
        amount: 29.99
      };
      return planData;
    } else {
      return false;
    }
  },
  updateUserPlan: function(update){
    // Check our update argument against our expected pattern.
    check(update, {
      auth: String,
      user: String,
      plan: String,
      status: String,
      date: Number
    });

    // Before we perform the update, ensure that the auth token passed is valid.
    if ( update.auth == SERVER_AUTH_TOKEN ){
      // If arguments are valid, continue with updating the user.
      Meteor.users.update(update.user, {
        $set: {
          "profile.subscription.plan.name": update.plan,
          "profile.subscription.ends": update.date,
          //"profile.subscription.payment.nextPaymentDue": update.date,
          "profile.subscription.status": update.status
        }
      }, function(error){
        if (error) {
          console.log(error);
        }
      });
    } else {
      throw new Meteor.Error('invalid-auth-token', 'Sorry, your server authentication token is invalid.');
    }
  }
});
