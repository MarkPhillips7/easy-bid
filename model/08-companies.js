Companies = new Mongo.Collection("companies");

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
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageUsers, Config.roles.user], Roles.GLOBAL_GROUP)) {
      return false;
    }

    return true;
  },
  update: function (userId, company, fields, modifier) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles.manageUsers], Roles.GLOBAL_GROUP)
        && !Roles.userIsInRole(userId, [Config.roles.manageUsers], company.name)) {
      return false;
    }

    return true;
  },
  remove: function (userId, company) {
    return false;
  }
});

