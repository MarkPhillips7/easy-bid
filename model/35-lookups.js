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
  // supplierId corresponds to a company id
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

// with keyStrings like ['car key', 'house key'] expect return like 'carkey|housekey'
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

const getIconStack2xClass = (lookupType) => {
  return "fa fa-circle-o fa-stack-2x";
};

const getIconStack1xClass = (lookupType) => {
  switch (lookupType) {
    case Constants.lookupTypes.label:
      return "fa fa-ellipsis-h fa-stack-1x";
    case Constants.lookupTypes.price:
      return "fa fa-dollar fa-stack-1x";
    case Constants.lookupTypes.standard:
    default:
      return "fa fa-arrow-up fa-stack-1x";
  }
};

const getStackedIcon = (lookupType) => {
  return `<span class="fa-stack">
      <i class="${getIconStack2xClass(lookupType)}"></i>
      <i class="${getIconStack1xClass(lookupType)}"></i>
    </span>`;
};

const getLookupTypeOptions = (selectedLookupType) => {
  return [
    {
      icon: "<span></span>",
      name: "Any",
      ticked: !selectedLookupType
    },
    ..._.chain(Constants.lookupTypes)
    .keys()
    .map((lookupTypeKey) => {
      const lookupType = Constants.lookupTypes[lookupTypeKey];
      return {
        lookupType,
        icon: getStackedIcon(lookupType),
        name: lookupType,
        ticked: lookupType === selectedLookupType
      };
    })
    .value()
  ];
}

const getLookupKeyOptions = (selectedTemplateLibrary, selectedLookupType) => {
  // if (!templateLibrary || !templateLibrary.templates)
  // return _.chain(templateLibrary.templates)
  //   .filter((template) => template.)
  return [
    {
      icon: "<span></span>",
      name: "Any",
      lookupKey: undefined,
      ticked: !selectedLookupType,
    }, {
      icon: "<span></span>",
      name: "Drawer Slides",
      lookupKey: "DrawerSlides",
      ticked: false,
    },
  ];
}

LookupsHelper = {
  getIconStack1xClass,
  getIconStack2xClass,
  getLookupKey,
  getLookupKeyOptions,
  getLookupValue,
  getLookupTypeOptions,
  isValidLookup,
}
