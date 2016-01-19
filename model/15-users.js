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
  //personInfo: {
  //  type: Schema.Person,
  //  optional: true
  //},
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
  nameLower: {
    type: String,
    // For some reason firstName.isSet and lastName.isSet are always false (https://github.com/aldeed/meteor-collection2/issues/247)
    // autoValue: function() {
    //   const firstName = this.field("firstName");
    //   const lastName = this.field("lastName");
    //   if (firstName.isSet && lastName.isSet) {
    //     const firstNameLower = firstName.value.toLowerCase();
    //     const lastNameLower = lastName.value.toLowerCase();
    //     return `${firstNameLower} ${lastNameLower}`;
    //   } else {
    //     this.unset();
    //   }
    // },
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
  stripeCustomerId: {
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
