Meteor.publish("job", function (jobId) {
  check(jobId, Match.OneOf(String, null));

  if (!this.userId) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  const loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser) {
    throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
  }

  if (!Meteor.call('userCanViewJob', this.userId, jobId)) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  return jobId && Jobs.find({ _id: jobId });
});

Meteor.publish("jobs", function (companyId, customerId, options, searchString) {
  check(companyId, Match.OneOf(String, null, undefined));
  check(customerId, Match.OneOf(String, null, undefined));
  check(options, Match.Any);
  check(searchString, Match.Any);

  if (!this.userId) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  if (searchString == null)
    searchString = '';

  let loggedInUser = Meteor.users.findOne(this.userId);

  if (!loggedInUser) {
    throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
  }

  let companyIdsToFilterBy;

  if (Roles.userIsInRole(loggedInUser, [Config.roles.manageTemplates, Config.roles.systemAdmin], Roles.GLOBAL_GROUP)) {
    companyIdsToFilterBy = companyId ? [companyId] : null;
  } else {
    companyIdsToFilterBy = Meteor.call('companyIdsRelatedToUser', this.userId);
  }

  let selector = {
    '$or': [
      {
        '$and': [
          {
            'name': {
              '$regex': '.*' + searchString || '' + '.*',
              '$options': 'i'
            }
          },
          {'name': {$exists: true}}
        ]
      }, {
        '$and': [
          {
            'addressLower': {
              '$regex': '.*' + searchString || '' + '.*',
              '$options': 'i'
            }
          },
          {'addressLower': {$exists: true}}
        ]
      }
    ]
  };

  if (companyIdsToFilterBy) {
    selector['companyId'] =  { $in: companyIdsToFilterBy };
  }

  if (customerId) {
    selector['customerId'] = customerId;
  } else {
    // If no customer is specified then include customer name by the search string
    selector['$or'].push({
      '$and': [
        {
          'customerProfile.nameLower': {
            '$regex': '.*' + searchString || '' + '.*',
            '$options': 'i'
          }
        },
        {'customerProfile.nameLower': {$exists: true}}
      ]
    })
  }

  Counts.publish(this, 'numberOfJobs', Jobs.find(selector,{
    noReady: true
  }));

  return Jobs.find(selector, options);
});
