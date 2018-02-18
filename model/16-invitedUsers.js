InvitedUsers = new Mongo.Collection("invitedUsers");

Schema.InvitedUser = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  email: {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  emailLower: {
    type: String,
    autoValue: function() {
      let email = this.field("email");
      if (email.isSet) {
        return email.value.toLowerCase();
      } else {
        this.unset();
      }
    }
  },
  companyId: {
    type: String,
  },
  role: {
    type: String,
  },
  expirationDate: {
    type: Date,
    optional: true
  },
  createdBy: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
  },
});

InvitedUsers.attachSchema(Schema.InvitedUser);

// does not look easy to use auto form (SimpleSchema) with angular.
// I tried using autoformly, but it does not have npm package and does not seem to be used, so...
InvitedUserFields = [
  {
    key: 'firstName',
    type: 'input',
    templateOptions: {
      label: 'First Name',
      required: true
    }
  },
  {
    key: 'lastName',
    type: 'input',
    templateOptions: {
      label: 'Last Name',
      required: true,
    }
  },
  {
    key: 'email',
    type: 'input',
    templateOptions: {
      type: 'email',
      label: 'Email Address',
      // placeholder: 'Enter email',
      required: true,
    }
  },
];
