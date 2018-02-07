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
