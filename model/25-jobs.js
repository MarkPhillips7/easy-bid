Jobs = new Mongo.Collection("jobs");

Schema.Job = new SimpleSchema({
  name: {
    type: String,
    regEx: /^[a-z0-9A-z .]{3,30}$/
  },
  nameLower: {
    type: String,
    autoValue: function() {
      let name = this.field("name");
      if (name.isSet) {
        return name.value.toLowerCase();
      } else {
        this.unset();
      }
    }
  },
  address: {
    type: Schema.Address,
    optional: true
  },
  addressLower: {
    type: String,
    autoValue: function() {
      let address = this.field("address");
      if (address.isSet) {
        const addressLinesLower = address.value.addressLines && address.value.addressLines.toLowerCase();
        const cityLower = address.value.city && address.value.city.toLowerCase();
        const stateLower = address.value.state && address.value.state.toLowerCase();
        return `${addressLinesLower} ${cityLower} ${stateLower} ${address.value.zipCode}`;
      } else {
        this.unset();
      }
    },
    optional: true
  },
  createdBy: {
    type: String,
    //denyUpdate: true,
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
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date};
      } else {
        this.unset();
      }
    }
  },
  dueAt: {
    type: Date,
    optional: true
  },
  notes: {
    type: String,
    optional: true
  },
  estimatorProfile: {
    type: Schema.UserProfile,
    optional: true
  },
  estimatorId: {
    type: String,
    optional: true
  },
  provisions: {
    type: String,
    optional: true
  },
  exclusions: {
    type: String,
    optional: true
  },
  company: {
    type: Schema.Company,
    optional: true
  },
  companyId: {
    type: String,
    optional: true
  },
  customerProfile: {
    type: Schema.UserProfile,
    optional: true
  },
  customerId: {
    type: String,
    optional: true
  }
});

Jobs.attachSchema(Schema.Job);

Jobs.allow({

  // eventually allow a customer to insert and update his jobs if flagged appropriately

  insert: function (userId, job) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.user], Roles.GLOBAL_GROUP)
      && !Roles.userIsInRole(userId, [Config.roles.user], job.companyId)) {
      return false;
    }

    return true;
  },
  update: function (userId, job, fields, modifier) {
    return Meteor.call('userCanUpdateJob', userId, job, fields, modifier);
  },
  remove: function (userId, job) {
    return false;
  }
});

JobsHelper = {
};
