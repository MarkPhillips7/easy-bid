Meteor.publish("lookup", function (lookupId) {
  check(lookupId, Match.OneOf(String, null));
  return lookupId && Lookups.find({ _id: lookupId });
});

Meteor.publish("lookups", function(supplierId, templateLibraryId, lookupType, lookupSubType,
    lookupKey, lookupName, options, searchString) {
  check(supplierId, Match.OneOf(String, null));
  check(templateLibraryId, Match.OneOf(String, null));
  check(lookupType, Match.OneOf(String, null));
  check(lookupSubType, Match.OneOf(String, null));
  check(lookupKey, Match.OneOf(String, null));
  check(lookupName, Match.OneOf(String, null));
  check(options, Match.Any);
  check(searchString, Match.OneOf(String, null));

  if (!supplierId && !templateLibraryId) {
    // throw new Meteor.Error('no-supplier-or-template-library-specified', 'Sorry, at least one of supplierId and templateLibraryId must be specified.');
    return this.ready();
  }

  if (searchString == null) {
    searchString = '';
  }

  const loggedInUser = Meteor.users.findOne(this.userId);
  if (!loggedInUser) {
    throw new Meteor.Error('user-not-found', 'Sorry, user not found.');
  }

  if (!Roles.userIsInRole(loggedInUser, [
      Config.roles.manageUsers,
      Config.roles.systemAdmin
    ], Roles.GLOBAL_GROUP) &&
    !Roles.userIsInRole(loggedInUser, [
      Config.roles.manageTemplates,
      Config.roles.manageUsers,
      Config.roles.user
    ], supplierId)) {
    throw new Meteor.Error('not-authorized', 'Sorry, you are not authorized.');
  }

  const fieldsToSearch = ['value'];
  if (!lookupKey) { fieldsToSearch.push('key'); }
  if (!lookupName) { fieldsToSearch.push('name'); }

  const selectorAndList = [];
  if (searchString) {
    selectorAndList.push({
      '$or': _.map(fieldsToSearch, (field) => {
        return {
          [field]: {
            '$regex': '.*' + searchString || '' + '.*',
            '$options': 'i'
          }
        };
      })
    });
  }
  // only 1 of supplierId and templateLibraryId need to exist in a document
  if (supplierId && templateLibraryId) {
    selectorAndList.push({
      '$or': {
        supplierId,
        templateLibraryId
      }
    });
  } else {
    if (supplierId) {
      selectorAndList.push({supplierId});
    };
    if (templateLibraryId) {
      selectorAndList.push({templateLibraryId});
    }
  }
  if (lookupType) {
    selectorAndList.push({lookupType});
  }
  if (lookupSubType) {
    selectorAndList.push({lookupSubType});
  }
  if (lookupKey) {
    selectorAndList.push({key: lookupKey});
  }
  if (lookupName) {
    selectorAndList.push({name: lookupName});
  }

  const selector = {
    '$and': selectorAndList
  };
  const _options = {
    ...options,
    fields: {
      createdAt: 1,
      name: 1,
    },
  }

  console.log(`selector: ${JSON.stringify(selector)} | options: ${JSON.stringify(options)}`);

  Counts.publish(this, 'numberOfLookups', Lookups.find(selector), {
    noReady: true
  });

  return Lookups.find(selector, options);
});
