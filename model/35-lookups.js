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
  // icon: {
  //   type: String,
  //   optional: true,
  // },
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
  createdBy: {
    type: String,
    optional: true
  },
  createdAt: {
    type: Date,
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
  const iconHtml = getSettingValue(lookup, Constants.lookupSettingKeys.iconHtml);
  if (iconHtml) {
    // expecting iconHtml to be something like '<i class="fa fa-dollar"></i>'
    return iconHtml;
  }
  const iconStack1xClass = getSettingValue(lookup, Constants.lookupSettingKeys.iconStack1xClass);
  const iconStack2xClass = getSettingValue(lookup, Constants.lookupSettingKeys.iconStack2xClass);
  if (iconStack1xClass && iconStack2xClass) {
    return getStackedIcon(iconStack1xClass, iconStack2xClass);
  }
  return "<span></span>";
};

// undefinedOption can be undefined, 'Any', 'None'
const getLookupTypeOptions = (lookupData, selectedLookupType, undefinedOption) => {
  if (!lookupData) {
    return undefined;
  }
  let lookupTypeOptions = [];
  if (undefinedOption) {
    lookupTypeOptions = [{
      icon: "<span></span>",
      name: undefinedOption,
      ticked: !selectedLookupType
    }];
  }
  return [
    ...lookupTypeOptions,
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

const getLookupSubTypeOptions = (lookupData, lookupType, selectedLookupSubType, undefinedOption) => {
  const keyStart = `${Constants.hierarchyRoot}${lookupType}`;
  let lookupSubTypeOptions = [];
  if (undefinedOption) {
    lookupSubTypeOptions = [{
      icon: "<span></span>",
      lookupSubType: '',
      name: undefinedOption,
      ticked: !selectedLookupSubType
    }];
  }
  return [
    ...lookupSubTypeOptions,
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

const getLookupKeyOptions = (lookupData, lookupType, lookupSubType, selectedLookupKey, undefinedOption) => {
  let lookupKeyOptions = [];
  if (undefinedOption) {
    lookupKeyOptions = [{
      icon: "<span></span>",
      name: undefinedOption,
      ticked: !selectedLookupKey
    }];
  }
  return [
    ...lookupKeyOptions,
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

const addLookup = (templateLibrary, lookups, lookupType, lookupSubType, key, name, value,
  lookupSettings, effectiveDate, expirationDate, userId) => {
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
      lookupSettings,
      effectiveDate: effectiveDate || new Date(),
      expirationDate,
      createdAt: new Date(),
      createdBy: userId,
    });
  }
}

const addPriceLookup = (templateLibrary, lookups, generalProductName, productSku,
  productName, price, unitsText, userId) => {
  const lookupKey = LookupsHelper.getLookupKey(productSku);
  const lookupType = Constants.lookupTypes.price;
  const lookupSubType = generalProductName;
  // should not have multiple lookups with the same key
  if (!_.some(lookups, (lookup) => lookup.key === lookupKey)) {
    addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
      `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, lookupSubType, undefined, undefined, undefined, userId);
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
      createdAt: new Date(),
      createdBy: userId,
    });
  }
}

const addProductSkuLookup = (templateLibrary, lookups, generalProductName, productSku, productName, userId) => {
  const lookupKey = generalProductName; // LookupsHelper.getLookupKey(generalProductName);
  const lookupType = Constants.lookupTypes.standard;
  const lookupSubType = 'Product';
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
    `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, lookupSubType, undefined, undefined, undefined, userId);
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
    createdAt: new Date(),
    createdBy: userId,
  });
}

const getDateStatus = (lookup) => {
  if (!lookup.effectiveDate) {
    return Constants.dateStatuses.neverEffective;
  } else if (moment().isAfter(lookup.effectiveDate)) {
    if (!lookup.expirationDate) {
      return Constants.dateStatuses.effectiveInPastNoExpiration;
    } else if (moment().isAfter(lookup.expirationDate)) {
      return Constants.dateStatuses.expired;
    }
    return Constants.dateStatuses.effectiveInPastWillExpire;
  }
  if (!lookup.expirationDate) {
    return Constants.dateStatuses.effectiveInFutureNoExpiration;
  }
  return Constants.dateStatuses.effectiveInFutureWillExpire;
};

const getDateStatusIconClass = (lookup) => {
  const dateStatus = getDateStatus(lookup);
  switch (dateStatus) {
    case Constants.dateStatuses.effectiveInPastNoExpiration:
      return "fa fa-calendar-check-o eb-bold-success";
    case Constants.dateStatuses.expired:
      return "fa fa-calendar-minus-o eb-bold-danger";
    case Constants.dateStatuses.effectiveInPastWillExpire:
      return "fa fa-calendar-check-o eb-bold-success";
    case Constants.dateStatuses.effectiveInFutureNoExpiration:
      return "fa fa-calendar-plus-o eb-bold-warning";
    case Constants.dateStatuses.effectiveInFutureWillExpire:
      return "fa fa-calendar-plus-o eb-bold-warning";
  }
};

const getDateStatusTooltip = (lookup, $filter) => {
  const dateStatus = getDateStatus(lookup);
  switch (dateStatus) {
    case Constants.dateStatuses.effectiveInPastNoExpiration:
      return `effective ${$filter('amDateFormat')(lookup.effectiveDate, 'MMMM Do, YYYY')}`;
    case Constants.dateStatuses.expired:
      return `expired ${$filter('amDateFormat')(lookup.expirationDate, 'MMMM Do, YYYY')}`;
    case Constants.dateStatuses.effectiveInPastWillExpire:
      return `effective ${$filter('amDateFormat')(lookup.effectiveDate, 'MMMM Do, YYYY')}, expires ${$filter('amDateFormat')(lookup.expirationDate, 'MMMM Do, YYYY')}`;
    case Constants.dateStatuses.effectiveInFutureNoExpiration:
      return `effective ${$filter('amDateFormat')(lookup.effectiveDate, 'MMMM Do, YYYY')}`;
    case Constants.dateStatuses.effectiveInFutureWillExpire:
      return `effective ${$filter('amDateFormat')(lookup.effectiveDate, 'MMMM Do, YYYY')}, expires ${$filter('amDateFormat')(lookup.expirationDate, 'MMMM Do, YYYY')}`;
  }
  return `?`;
}

const getDateStatusText = (lookup, $filter) => {
  const dateStatus = getDateStatus(lookup);
  switch (dateStatus) {
    case Constants.dateStatuses.effectiveInPastNoExpiration:
      return `effective ${$filter('amTimeAgo')(lookup.effectiveDate)}`;
    case Constants.dateStatuses.expired:
      return `expired ${$filter('amTimeAgo')(lookup.expirationDate)}`;
    case Constants.dateStatuses.effectiveInPastWillExpire:
      return `expires ${$filter('amTimeAgo')(lookup.expirationDate)}`;
    case Constants.dateStatuses.effectiveInFutureNoExpiration:
      return `effective ${$filter('amTimeAgo')(lookup.effectiveDate)}`;
    case Constants.dateStatuses.effectiveInFutureWillExpire:
      return `effective ${$filter('amTimeAgo')(lookup.effectiveDate)}`;
  }
  return `?`;
}

LookupsHelper = {
  addLookup,
  addPriceLookup,
  addProductSkuLookup,
  getDateStatus,
  getDateStatusIconClass,
  getDateStatusText,
  getDateStatusTooltip,
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
