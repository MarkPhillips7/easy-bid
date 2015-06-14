Companies = new Mongo.Collection("companies");

Schema.Address = new SimpleSchema({
  // Possibly multiple-line data representing street address with apartment number like this:
  // 150 Grayrock Dr
  // Suite B1
  addressLines: {
    type: String
  },
  city: {
    type: String,
    max: 50
  },
  state: {
    type: String,
    regEx: /^A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]$/
  },
  zipCode: {
    type: String,
    regEx: /^\d{5}$|^\d{5}-\d{4}$/
  },
});

Schema.Company = new SimpleSchema({
  name: {
    type: String,
    regEx: /^[a-z0-9A-z .]{3,30}$/
  },
  address: {
    type: Schema.Address,
    optional: true
  },
  createdBy: {
    type: String,
    denyUpdate: true,
    //autoValue: function() {
    //  if (this.isInsert) {
    //    return this.userId;
    //  } else if (this.isUpsert) {
    //    return {$setOnInsert: this.userId};
    //  } else {
    //    this.unset();
    //}
    //},
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function() {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  },
  websiteUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  logoUrl: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  }
});

Companies.attachSchema(Schema.Company);

Companies.allow({
  insert: function (userId, company) {
    if (!Roles.userIsInRole(userId, ['system-admin', 'manage-users', 'user'], Roles.GLOBAL_GROUP))
      return false;

    return true;
  },
  update: function (userId, company, fields, modifier) {
    if (!Roles.userIsInRole(userId, ['system-admin', 'manage-users'], Roles.GLOBAL_GROUP)
        && !Roles.userIsInRole(userId, ['manage-users'], company.name))
      return false;

    return true;
  },
  remove: function (userId, company) {
    return false;
  }
});

Schema.UserCountry = new SimpleSchema({
  name: {
    type: String
  },
  code: {
    type: String,
    regEx: /^[A-Z]{2}$/
  }
});

Schema.SubscriptionPlan = new SimpleSchema({
  name: {
    type: String
  }
});
Schema.Subscription = new SimpleSchema({
  plan: {
    type: Schema.SubscriptionPlan
  },
  status: {
    type: String
  },
  ends: {
    type: Date
  }
});
//
//Schema.Person = new SimpleSchema({
//  firstName: {
//    type: String,
//    regEx: /^[a-zA-Z-]{2,25}$/,
//    optional: true
//  },
//  lastName: {
//    type: String,
//    regEx: /^[a-zA-Z]{2,25}$/,
//    optional: true
//  },
//  address: {
//    type: Schema.Address,
//    optional: true
//  },
//  birthday: {
//    type: Date,
//    optional: true
//  },
//  gender: {
//    type: String,
//    allowedValues: ['Male', 'Female'],
//    optional: true
//  },
//  phoneNumber: {
//    type: String,
//    optional: true
//  },
//  notes: {
//    type: String,
//    optional: true
//  }
//});
//
////A client is somebody wanting a bid from company
//Schema.Client = new SimpleSchema({
//  // Just create a login for the customer even if there is no way to login initially so that someday
//  // customer can create a password and login and look at interactive bids or something like that
//  userId: {
//    type: Meteor.Collection.ObjectID
//  },
//  companyId: {
//    type: Meteor.Collection.ObjectID
//  }
//}
//
////Somebody who works for a company (does not have to be an actual paid employee)
//Schema.Employee = new SimpleSchema({
//  userId: {
//    type: Meteor.Collection.ObjectID
//  },
//  companyId: {
//    type: Meteor.Collection.ObjectID
//  },
//}

Schema.UserProfile = new SimpleSchema({
  personInfo: {
    type: Schema.Person,
    optional: true
  },
  firstName: {
    type: String,
    regEx: /^[a-zA-Z-]{2,25}$/,
    optional: true
  },
  lastName: {
    type: String,
    regEx: /^[a-zA-Z]{2,25}$/,
    optional: true
  },
  address: {
    type: Schema.Address,
    optional: true
  },
  birthday: {
    type: Date,
    optional: true
  },
  gender: {
    type: String,
    allowedValues: ['Male', 'Female'],
    optional: true
  },
  organization : {
    type: String,
    regEx: /^[a-z0-9A-z .]{3,30}$/,
    optional: true
  },
  website: {
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true
  },
  bio: {
    type: String,
    optional: true
  },
  country: {
    type: Schema.UserCountry,
    optional: true
  },
  subscription: {
    type: Schema.Subscription,
    optional: true
  },
  customerId: {
    type: String,
    optional: true
  },
  phoneNumber: {
    type: String,
    optional: true
  },
  notes: {
    type: String,
    optional: true
  }
});

Schema.User = new SimpleSchema({
  username: {
    type: String,
    regEx: /^[a-z0-9A-Z_]{3,15}$/,
    optional: true
  },
  emails: {
    type: [Object],
    // this must be optional if you also use other login services like facebook,
    // but if you use only accounts-password, then it can be required
    //optional: true
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean
  },
  createdAt: {
    type: Date
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

Meteor.users.attachSchema(Schema.User);

Meteor.users.allow({
  update: function() {
    return false;
  }
});