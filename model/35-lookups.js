Lookups = new Mongo.Collection("lookups");

Schema.LookupSetting = new SimpleSchema({
  // Using an id since we want these to be able to be referenced even though they are not in their own collection
  id: {
    type: String
  },
  // Use Constants.lookupSettingKeys
  key: {
    type: String
  },
  value: {
    type: String,
    optional: true
  },
  order: {
    type: Number,
    optional: true
  }
});

Schema.Lookup = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  // Use Constants.lookupTypes (this helps to avoid key collisions)
  lookupType: {
    type: String,
  },
  templateLibraryId: {
    type: String, // not optional, but can be some global value to be used by multiple template libraries
  },
  supplierId: {
    type: String,
    optional: true
  },
  // key can be any string such as SKU for product price
  key: {
    type: String,
  },
  name: {
    type: String,
  },
  effectiveDate: {
    type: Date
  },
  expirationDate: {
    type: Date,
    optional: true
  },
  lookupSettings: {
    type: [Schema.LookupSetting],
    optional: true
  },
  value: {
    type: String,
  },
});

Lookups.attachSchema(Schema.Lookup);

const getLookupKey = (...keyStrings) => {
  return _.reduce(keyStrings, (memo, keyString) => {
    return `${memo}${memo.length > 0 ? '|' : ''}${keyString.replace(/\s/g, '')}`;
  }, '');
}

const getLookupValue = (lookupData, lookupType, lookupKey) => {
  if (!lookupData || !lookupType || !lookupKey) {
    return null;
  }
  
  switch (lookupType) {
    case Constants.lookupTypes.price:
    case Constants.lookupTypes.standard:
    default:
      const lookupRecords = lookupData && _.filter(lookupData['standard'], (lookup) => {
        const now = new Date();
        return lookup.lookupType === lookupType
          && lookup.effectiveDate < now
          && (!lookup.expirationDate || lookup.expirationDate > now)
          && lookup.key === lookupKey;
      });
      return lookupRecords.length && lookupRecords[0].value;
  }
}

const isValidLookup = (lookupData, lookupType, lookup) => {
  const now = new Date();
  return lookup.lookupType === lookupType
    && lookup.effectiveDate < now
    && !lookup.expirationDate || lookup.expirationDate > now;
}

LookupsHelper = {
  getLookupKey,
  getLookupValue,
  isValidLookup,
}
