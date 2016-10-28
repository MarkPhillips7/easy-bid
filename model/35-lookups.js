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
  // something like '<i class="fa fa-dollar"></i>' (other options available via Constants.lookupSettingKeys.iconType)
  icon: {
    type: String,
    optional: true,
  },
  // Use Constants.lookupTypes (this helps to avoid key collisions)
  lookupType: {
    type: String,
  },
  // If lookupType is Price, lookupSubType could be 'Drawer Slides'
  lookupSubType: {
    type: String,
    optional: true,
  },
  templateLibraryId: {
    type: String, // not optional, but can be some global value to be used by multiple template libraries
  },
  // supplierId corresponds to a company id
  supplierId: {
    type: String,
    optional: true,
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

const getSettingValue = (lookup, settingKey) => {
  if (lookup && settingKey) {
    var setting = _.find(lookup.lookupSettings, function (setting) {
      return (setting.key === settingKey);
    });
    if (setting) {
      return setting.value;
    }
  }

  return null;
}

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
  return "fa fa-square-o fa-stack-2x";
};

const getIconStack1xClass = (lookupType) => {
  switch (lookupType) {
    case Constants.lookupTypes.label:
      return "fa fa-ellipsis-h fa-stack-1x";
    case Constants.lookupTypes.price:
      return "fa fa-dollar fa-stack-1x";
    case Constants.lookupTypes.hierarchical:
      return "fa fa-sitemap fa-stack-1x";
    case Constants.lookupTypes.standard:
    default:
      return "fa fa-arrow-up fa-stack-1x";
  }
};
//
// const getStackedIcon = (lookupType) => {
//   return `<span class="fa-stack">
//       <i class="${getIconStack2xClass(lookupType)}"></i>
//       <i class="${getIconStack1xClass(lookupType)}"></i>
//     </span>`;
// };

const getStackedIcon = (iconStack1xClass, iconStack2xClass) => {
  return `<span class="fa-stack">
      <i class="${iconStack1xClass}"></i>
      <i class="${iconStack2xClass}"></i>
    </span>`;
};

const getIcon = (lookup) => {
  // ToDo: update to check options available via something like Constants.lookupSettingKeys.iconType
  if (lookup.icon) {
    return lookup.icon;
  }
  const iconStack1xClass = getSettingValue(lookup, Constants.lookupSettingKeys.iconStack1xClass);
  const iconStack2xClass = getSettingValue(lookup, Constants.lookupSettingKeys.iconStack2xClass);
  if (iconStack1xClass && iconStack2xClass) {
    return getStackedIcon(iconStack1xClass, iconStack2xClass);
  }
  return "<span></span>";
};

const getLookupTypeOptions = (lookupData, selectedLookupType) => {
  return [
    {
      icon: "<span></span>",
      name: "Any",
      ticked: !selectedLookupType
    },
    ..._.chain(lookupData.standard)
    .filter((lookup) => lookup.lookupType === Constants.lookupTypes.hierarchical &&
      lookup.lookupSubType === Constants.lookupSubTypes.lookupType &&
      lookup.key === Constants.hierarchyRoot)
    .map((lookup) => {
      return {
        lookupType: lookup.value,
        icon: getIcon(lookup),
        name: lookup.name,
        ticked: lookup.value === selectedLookupType
      };
    })
    .value()
  ];
}

const getLookupSubTypeOptions = (lookupData, lookupType, selectedLookupSubType) => {
  const keyStart = `${Constants.hierarchyRoot}${lookupType}`;
  return [
    {
      icon: "<span></span>",
      name: "Any",
      ticked: !selectedLookupSubType
    },
    ..._.chain(lookupData.standard)
    .filter((lookup) => lookup.lookupType === Constants.lookupTypes.hierarchical &&
      lookup.lookupSubType === Constants.lookupSubTypes.lookupSubType &&
      (!lookupType || lookup.key.substring(0, keyStart.length) === keyStart))
    .map((lookup) => {
      return {
        lookupSubType: lookup.value,
        icon: "<span></span>",
        name: lookup.name,
        ticked: lookup.value === selectedLookupSubType
      };
    })
    .value()
  ];
};

const getLookupKeyOptions = (lookupData, lookupType, lookupSubType, selectedLookupKey) => {
  return [
    {
      icon: "<span></span>",
      name: "Any",
      ticked: !selectedLookupKey
    },
    ..._.chain(lookupData.standard)
    .filter((lookup) => lookup.lookupType === lookupType &&
      lookup.lookupSubType === lookupSubType)
    .map((lookup) => lookup.key)
    .uniq()
    //   lookup.lookupSubType === Constants.lookupSubTypes.lookupKey &&
    //   (!lookupType || lookup.key === `${Constants.hierarchyRoot}${lookupType}.${lookupSubType}`))
    .map((lookupKey) => {
      return {
        lookupKey: lookupKey,
        icon: "<span></span>",
        name: lookupKey,
        ticked: lookupKey === selectedLookupKey
      };
    })
    .value()
  ];
}

const addLookup = (templateLibrary, lookups, lookupType, lookupSubType, key, name, value, lookupSettings) => {
  // should not have multiple lookups with the same key and value
  if (!_.some(lookups, (lookup) => lookup.templateLibraryId === templateLibrary._id && lookup.lookupType === lookupType &&
      lookup.lookupSubType === lookupSubType && lookup.key === key && lookup.value === value)) {
    lookups.push({
      lookupType,
      lookupSubType,
      templateLibraryId: templateLibrary._id,
      // supplierId,
      key,
      name,
      value,
      effectiveDate: new Date(),
      lookupSettings,
    });
  }
}

const addPriceLookup = (templateLibrary, lookups, generalProductName, productSku, productName, price, unitsText) => {
  const lookupKey = LookupsHelper.getLookupKey(productSku);
  const lookupType = Constants.lookupTypes.price;
  const lookupSubType = generalProductName;
  // should not have multiple lookups with the same key
  if (!_.some(lookups, (lookup) => lookup.key === lookupKey)) {
    addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
      `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, lookupSubType);
    // addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupKey,
    //   `${Constants.hierarchyRoot}${lookupType}.${lookupSubType}`, lookupKey, lookupKey);
    lookups.push({
      lookupType,
      lookupSubType,
      templateLibraryId: templateLibrary._id,
      // supplierId,
      key: lookupKey,
      name: productName,
      value: price,
      effectiveDate: new Date(),
      lookupSettings: [{
        id: Random.id(),
        key: Constants.lookupSettingKeys.unitsText,
        value: unitsText,
      }],
    });
  }
}

const addProductSkuLookup = (templateLibrary, lookups, generalProductName, productSku, productName) => {
  const lookupKey = generalProductName; // LookupsHelper.getLookupKey(generalProductName);
  const lookupType = Constants.lookupTypes.standard;
  const lookupSubType = 'Product';
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
    `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, lookupSubType);
  // addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupKey,
  //   `${Constants.hierarchyRoot}${lookupType}.${lookupSubType}`, lookupKey, lookupKey);
  // it is expected to have multiple lookups with the same key
  lookups.push({
    lookupType,
    lookupSubType,
    templateLibraryId: templateLibrary._id,
    // supplierId,
    key: lookupKey,
    name: productName,
    value: LookupsHelper.getLookupKey(productSku),
    effectiveDate: new Date(),
  });
}

LookupsHelper = {
  addLookup,
  addPriceLookup,
  addProductSkuLookup,
  getIconStack1xClass,
  getIconStack2xClass,
  getLookupKey,
  getLookupKeyOptions,
  getLookupValue,
  getLookupSubTypeOptions,
  getLookupTypeOptions,
  getSettingValue,
  isValidLookup,
}
