Companies = new Mongo.Collection("companies");

Schema.Company = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    // regEx: /^[a-z0-9A-z .]{3,30}$/
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
    // autoValue: function() {
    //   if (this.isInsert) {
    //     return new Date;
    //   } else if (this.isUpsert) {
    //     return {
    //       $setOnInsert: new Date
    //     };
    //   } else {
    //     this.unset();
    //   }
    // }
  },
  phoneNumber: {
    type: String,
    optional: true
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
  },
  salesTaxRate: {
    type: Number,
    optional: true
  },
  defaultTemplateLibraryId: {
    type: String,
    optional: true
  },
});

// does not look easy to use auto form (SimpleSchema) with angular.
// I tried using autoformly, but it does not have npm package and does not seem to be used, so...
CompanyFields = [
  {
    key: 'name',
    type: 'input',
    templateOptions: {
      label: 'Name',
      // placeholder: 'Bid Masters Inc',
      required: true
    }
  },
  {
    key: 'websiteUrl',
    type: 'input',
    templateOptions: {
      type: 'url',
      label: 'Website',
      placeholder: 'www.BidMasters.com',
      required: false,
    }
  },
  {
    key: 'logoUrl',
    type: 'input',
    templateOptions: {
      type: 'url',
      label: 'Logo',
      placeholder: 'www.BidMasters.com/company-logo.gif',
      required: false,
    }
  },
  {
    key: 'phoneNumber',
    type: 'input',
    templateOptions: {
      label: 'Phone Number',
      // placeholder: 'www.BidMasters.com',
      required: false,
    }
  },
  {
    key: 'address.addressLines',
    type: 'textarea',
    templateOptions: {
      label: 'Address',
      required: false,
    }
  },
  {
    className: 'row',
    fieldGroup: [
      {
        className: 'col-xs-6',
        key: 'address.city',
        type: 'input',
        templateOptions: {
          placeholder: 'City',
          required: false,
        }
      },
      {
        className: 'col-xs-2',
        key: 'address.state',
        type: 'input',
        templateOptions: {
          placeholder: 'State',
          required: false,
        }
      },
      {
        className: 'col-xs-4',
        key: 'address.zipCode',
        type: 'input',
        templateOptions: {
          placeholder: 'Zip Code',
          required: false,
        }
      }
    ]
  }
];

Companies.attachSchema(Schema.Company);

Companies.allow({
  insert: function(userId, company) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles
        .manageUsers, Config.roles.user
      ], Roles.GLOBAL_GROUP)) {
      return false;
    }

    return true;
  },
  update: function(userId, company, fields, modifier) {
    if (!Roles.userIsInRole(userId, [Config.roles.systemAdmin, Config.roles
        .manageUsers
      ], Roles.GLOBAL_GROUP) && !Roles.userIsInRole(userId, [Config.roles
        .manageUsers
      ], company._id)) {
      return false;
    }

    return true;
  },
  remove: function(userId, company) {
    return false;
  }
});
