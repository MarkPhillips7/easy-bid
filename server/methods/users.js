const checkUser = (user) => {
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
};

const getNewRolesForCompany = (user, companyId, roleToAdd) => {
  const rolesForCompany = user.roles && user.roles[companyId];

  if (rolesForCompany) {
    if (_.some(rolesForCompany, function (_role) {
      return _role === roleToAdd;
    })) {
      // user already has roleToAdd, so just return
      console.log(`${user.profile.firstName} ${user.profile.lastName} already had ${roleToAdd} role`);
      return;
    } else {
      return [ ...rolesForCompany, roleToAdd];
    }
  }

  return [roleToAdd];
};

Meteor.methods({
  getRolesLoggedInUserCanAssign: function(companyId) {
    check(companyId, Match.OneOf(String, null));

    console.log(`In getRolesLoggedInUserCanAssign for ${companyId}`);

    const loggedInUser = Meteor.userId();

    if (!loggedInUser) {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }

    if (companyId === Roles.GLOBAL_GROUP) {
      // What global roles can this user assign?
      if (Roles.userIsInRole(loggedInUser, [
        Config.roles.systemAdmin
      ], Roles.GLOBAL_GROUP)) {
        return [
          RolesHelper.getRoleObject(Config.roles.systemAdmin),
          RolesHelper.getRoleObject(Config.roles.manageTemplates),
          RolesHelper.getRoleObject(Config.roles.manageUsers),
          RolesHelper.getRoleObject(Config.roles.user),
          RolesHelper.getRoleObject(Config.roles.customer),
          RolesHelper.getRoleObject(Config.roles.guest),
        ];
      } else if (Roles.userIsInRole(loggedInUser, [
        Config.roles.manageUsers,
      ], Roles.GLOBAL_GROUP)) {
        return [
          RolesHelper.getRoleObject(Config.roles.manageTemplates),
          RolesHelper.getRoleObject(Config.roles.manageUsers),
          RolesHelper.getRoleObject(Config.roles.user),
          RolesHelper.getRoleObject(Config.roles.customer),
          RolesHelper.getRoleObject(Config.roles.guest),
        ];
      }
      return [];
    }

    // companyId is not global
    if (Roles.userIsInRole(loggedInUser, [
      Config.roles.systemAdmin,
      Config.roles.manageUsers
    ], Roles.GLOBAL_GROUP) ||
    Roles.userIsInRole(loggedInUser, [
      Config.roles.manageUsers
    ], companyId)) {
      return [
        RolesHelper.getRoleObject(Config.roles.manageTemplates),
        RolesHelper.getRoleObject(Config.roles.manageUsers),
        RolesHelper.getRoleObject(Config.roles.user),
        RolesHelper.getRoleObject(Config.roles.customer),
        RolesHelper.getRoleObject(Config.roles.guest),
      ];
    } else if (Roles.userIsInRole(loggedInUser, [
      Config.roles.user,
    ], companyId)) {
      return [
        RolesHelper.getRoleObject(Config.roles.customer),
        RolesHelper.getRoleObject(Config.roles.guest),
      ];
    }
    return [];
  },
  getRoleIdsForUserAndCompany: function(userId, companyId) {
    check(userId, Match.OneOf(String, null));
    check(companyId, Match.OneOf(String, null));

    if (userId === null || companyId === null) {
      return [];
    }

    const user =  Meteor.users.findOne(userId);
    if (user) {
      return user.roles && user.roles[companyId];
    }
  },
  createUserRelatedToCompany: function(user, companyId) {
    checkUser(user);
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
    checkUser(user);
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
  addUserRole: function (userId, roleToAdd, companyId) {
    check(userId, String);
    check(roleToAdd, String);
    check(companyId, String);

    let loggedInUser = Meteor.userId();

    switch (roleToAdd) {
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
      const roles = getNewRolesForCompany(user, companyId, roleToAdd);
      Roles.setUserRoles(userId, roles, companyId);
      console.log(`${user.profile.firstName} ${user.profile.lastName} was given ${roleToAdd} role`);
    } else {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }
  },
  getUserAndRoleInfo: function (emailAddressesText, role, companyId) {
    check(emailAddressesText, String);
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

    const emailRegularExpression = new RegExp(
      `[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*`,
      'g');
    const emailAddresses = emailAddressesText.match(emailRegularExpression);
    return emailAddresses
    ? _.map(emailAddresses, (emailAddress) => {
      const theUser = Accounts.findUserByEmail(emailAddress);
      const userAndRoleInfo = {
        emailAddress,
        name: theUser ? `${theUser.profile.firstName} ${theUser.profile.lastName}` : '',
        userExists: !!theUser,
        isInRole: theUser ? Roles.userIsInRole(theUser, [role], companyId) : false,
      };
      console.log(`role: ${role}, userAndRoleInfo: ${JSON.stringify(userAndRoleInfo)}`);
      return userAndRoleInfo;
    })
    : [];
  },
  addRolesSendInvitations: function (pendingActions, roleToAdd, companyId) {
    check(pendingActions, [{
      emailAddress: String,
      name: String,
      userExists: Boolean,
      isInRole: Boolean,
    }]);
    check(roleToAdd, String);
    check(companyId, String);

    let loggedInUser = Meteor.userId();

    switch (roleToAdd) {
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

    _.each(pendingActions, (pendingAction) => {
      if (pendingAction.userExists) {
        const user = Accounts.findUserByEmail(pendingAction.emailAddress);
        const userId = user && user._id;
        if (!pendingAction.isInRole) {
          const roles = getNewRolesForCompany(user, companyId, roleToAdd);
          Roles.setUserRoles(userId, roles, companyId);
          // console.log(`${user.profile.firstName} ${user.profile.lastName} was given ${roleToAdd} role`);

          // Send email to user that a new role has been added?
        }
      } else {
        // Send email to user indicating that invited with role related to company and will have role after signing up
        // pendingAction.emailAddress
      }
    });
  },
  removeUserRole: function (userId, role, companyId) {
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
      const rolesForCompany = user.roles && user.roles[companyId];

      if (rolesForCompany) {
        if (_.some(rolesForCompany, function (_role) {
          return _role === role;
        })) {
          const roleIndex = _.indexOf(rolesForCompany, role);
          console.log(`weird stuff: ${roleIndex} ${rolesForCompany.length}`);
          roles = [
            ..._.first(rolesForCompany, roleIndex),
            ..._.rest(rolesForCompany, roleIndex + 1),
          ];
        } else {
          console.log(`${user.profile.firstName} ${user.profile.lastName} already does not have ${role} role`);
          return;
        }
      }

      if (!roles) {
        // user already does not have role, so just return
        console.log(`${user.profile.firstName} ${user.profile.lastName} already does not have ${role} role`);
        return;
      }

      Roles.setUserRoles(userId, roles, companyId);
      console.log(`${roles.length}, ${user.profile.firstName} ${user.profile.lastName} had ${role} role removed`);
    } else {
      throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
    }
  },
  companyIdsRelatedToUser: function (userId) {
    check(userId, Match.OneOf(String, null));

    if (userId) {
      let companiesRelatedToUser = Roles.getGroupsForUser(userId);
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
  checkUserPlan: function (userId) {
    if (userId == null){
      return false;
    }

    check(userId, String);

    let getUser = Meteor.users.findOne({"_id": userId}, {fields: {"profile.subscription": 1}});
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
