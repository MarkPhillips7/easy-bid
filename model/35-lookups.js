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
  description: {
    type: String,
    optional: true
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
  // additional data where keys can be determined by the user
  // additionalSettings: {
  //   type: [Schema.LookupSetting],
  //   optional: true
  // },
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

const getSettingValueType = (lookup, settingKey) => {
  if (lookup && settingKey) {
    var setting = _.find(lookup.lookupSettings, function (setting) {
      return (setting.key === `${settingKey}Type`);
    });
    if (setting) {
      return setting.value;
    }
  }

  return null;
}

// returns true if items from the squished valueToLookUp match items from the
// lookupPattern or the lookupPattern items are wildcard text. Examples:
// lookupPattern       valueToLookUp         returns
// red|square          red|square            true
// red|square          green|square          false
// *|square            red|square            true
// *|square            red|circle            false
// red|*               red|square            true
// *|*                 red|square            true
// red|*               green|square          false
// *|*|*               green|square|dog      true
// *|*|*               green|square          false
const isWildcardMatch = (lookupPattern, valueToLookUp) => {
  const patternItems = lookupPattern.split('|');
  const valueItems = valueToLookUp.split('|');
  return patternItems.length === valueItems.length &&
    _.every(patternItems, (patternItem, index) => patternItem === Constants.lookupWildcardText || patternItem === valueItems[index]);
}

const isMatchOrWildcardMatch = (lookupPattern, valueToLookUp) => {
  return lookupPattern === valueToLookUp || isWildcardMatch(lookupPattern, valueToLookUp);
}

// remainingLookupKeys will sometimes represent [lookupKey, lookupSettingKey] and sometimes represent just [lookupSettingKey]
const getLookupValue = (lookupData, pricingAt, valueToLookUp, lookupType, lookupSubType, ...remainingLookupKeys) => {
  const getLookupValueResponse = (lookup, lookupSettingKey) => {
    let lookupValueType;
    let lookupValue = null;
    if (!lookup) {
      return {lookupValue, lookupValueType};
    }
    if (lookupSettingKey) {
      // Need to use value types all over the place because "0" != 0 according to expression evaluator
      lookupValueType = getSettingValueType(lookup, lookupSettingKey) || 'number';
      lookupValue = getSettingValue(lookup, lookupSettingKey);
    } else {
      lookupValueType = getSettingValue(lookup, Constants.lookupSettingKeys.lookupValueType) || 'number';
      lookupValue = lookup.value;
    }
    return {lookupValue, lookupValueType};
  };

  const getLookupValueResponseFromArray = (lookupRecords, lookupProperty, lookupSettingKey) => {
    // return the lookup record with the fewest '*'s in it
    return getLookupValueResponse(
      _.sortBy(lookupRecords, (lookupRecord) => (lookupRecord[lookupProperty].match(/\*/g) || []).length)[0],
      lookupSettingKey);
  }

  if (!lookupData || !lookupType || !valueToLookUp) {
    return getLookupValueResponse(null);
  }

  const pricingAtToUse = pricingAt || new Date();
  let lookupRecords;
  let lookupSettingKey;
  switch (lookupType) {
    case Constants.lookupTypes.price:
      lookupRecords = lookupData && _.filter(lookupData['standard'], (lookup) => {
        // valueToLookUp represents lookup key for price lookups
        return lookup.lookupType === lookupType
          && lookup.effectiveDate <= pricingAtToUse
          && (!lookup.expirationDate || lookup.expirationDate > pricingAtToUse)
          && isMatchOrWildcardMatch(lookup.key, valueToLookUp);
      });
      lookupSettingKey = remainingLookupKeys[0];
      if (lookupRecords.length) {
        return getLookupValueResponseFromArray(lookupRecords, 'key', lookupSettingKey);
      }
      break;
    case Constants.lookupTypes.range:
      // valueToLookUp represents value between lookupSettings Min and Max
      lookupKey = remainingLookupKeys[0];
      lookupSettingKey = remainingLookupKeys[1];
      lookupRecords = lookupData && _.filter(lookupData['standard'], (lookup) => {
        return lookup.lookupType === lookupType
          && lookup.lookupSubType === lookupSubType
          && lookup.key === lookupKey
          && lookup.effectiveDate <= pricingAtToUse
          && (!lookup.expirationDate || lookup.expirationDate > pricingAtToUse);
      });
      if (lookupRecords.length) {
        const lookupWithinRange = _.find(lookupRecords, (lookupRecord) => {
          const minValue = getSettingValue(lookupRecord, Constants.lookupSettingKeys.min);
          const maxValue = getSettingValue(lookupRecord, Constants.lookupSettingKeys.max);
          return (minValue === undefined || minValue === null || valueToLookUp >= minValue) &&
            (maxValue === undefined || maxValue === null || valueToLookUp < maxValue);
        })
        if (lookupWithinRange) {
          return getLookupValueResponse(lookupWithinRange);
        }
      }
      break;
    case Constants.lookupTypes.option:
      // valueToLookUp represents lookup name
      lookupKey = remainingLookupKeys[0];
      lookupSettingKey = remainingLookupKeys[1];
      lookupRecords = lookupData && _.filter(lookupData['standard'], (lookup) => {
        return lookup.lookupType === lookupType
          && lookup.lookupSubType === lookupSubType
          && lookup.key === lookupKey
          && isMatchOrWildcardMatch(lookup.name, valueToLookUp)
          && lookup.effectiveDate <= pricingAtToUse
          && (!lookup.expirationDate || lookup.expirationDate > pricingAtToUse);
      });
      if (lookupRecords.length) {
        return getLookupValueResponseFromArray(lookupRecords, 'name', lookupSettingKey);
      }
      break;
    case Constants.lookupTypes.basic:
    default:
      // valueToLookUp represents lookup key
      lookupSettingKey = remainingLookupKeys[0];
      lookupRecords = lookupData && _.filter(lookupData['standard'], (lookup) => {
        return lookup.lookupType === lookupType
          && lookup.lookupSubType === lookupSubType
          && isMatchOrWildcardMatch(lookup.key, valueToLookUp)
          && lookup.effectiveDate <= pricingAtToUse
          && (!lookup.expirationDate || lookup.expirationDate > pricingAtToUse);
      });
      if (lookupRecords.length) {
        return getLookupValueResponseFromArray(lookupRecords, 'key', lookupSettingKey);
      }
      break;
  }
  return getLookupValueResponse(null);
}

const isValidLookup = (lookupData, lookupType, lookupKey, lookup, pricingAt) => {
  const pricingAtToUse = pricingAt || new Date();
  return lookup.lookupType === lookupType
    && lookup.key === lookupKey
    && lookup.effectiveDate <= pricingAtToUse
    && (!lookup.expirationDate || lookup.expirationDate > pricingAtToUse);
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
    case Constants.lookupTypes.range:
      return "fa fa-arrows-h fa-stack-1x";
    case Constants.lookupTypes.option:
      return "fa fa-caret-down fa-stack-1x";
    case Constants.lookupTypes.basic:
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

const addLookup = (templateLibrary, lookups, lookupType, lookupSubType, key, name, description, value,
  lookupSettings, effectiveDate, expirationDate, userId) => {
  // should not have multiple lookups with the same key and value (and most everything else)
  if (_.some(lookups, (lookup) => lookup.templateLibraryId === templateLibrary._id && lookup.lookupType === lookupType &&
        lookup.lookupSubType === lookupSubType && lookup.key === key && lookup.name === name && lookup.value === value)) {
    return;
  }
  lookups.push({
    lookupType,
    lookupSubType,
    templateLibraryId: templateLibrary._id,
    // supplierId,
    key,
    name,
    description,
    value,
    lookupSettings,
    effectiveDate: effectiveDate || new Date(),
    expirationDate,
    createdAt: new Date(),
    createdBy: userId,
  });
}

const addPriceLookup = (templateLibrary, lookups, generalProductName, productSku,
  productName, description, price, unitsText, userId, effectiveDate) => {
  const lookupKey = productSku;
  const lookupType = Constants.lookupTypes.price;
  const lookupSubType = generalProductName;
  // should not have multiple lookups with the same key
  if (!_.some(lookups, (lookup) => lookup.key === lookupKey)) {
    addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
      `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, undefined, lookupSubType, undefined, undefined, undefined, userId);
    // addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupKey,
    //   `${Constants.hierarchyRoot}${lookupType}.${lookupSubType}`, lookupKey, lookupKey);
    addLookup(templateLibrary, lookups, lookupType, lookupSubType, lookupKey, productName, description, price, [{
      id: Random.id(),
      key: Constants.lookupSettingKeys.unitsText,
      value: unitsText,
    }], effectiveDate, undefined, userId);
    // lookups.push({
    //   lookupType,
    //   lookupSubType,
    //   templateLibraryId: templateLibrary._id,
    //   // supplierId,
    //   key: lookupKey,
    //   name: productName,
    //   description,
    //   value: price,
    //   effectiveDate: new Date(),
    //   lookupSettings: [{
    //     id: Random.id(),
    //     key: Constants.lookupSettingKeys.unitsText,
    //     value: unitsText,
    //   }],
    //   createdAt: new Date(),
    //   createdBy: userId,
    // });
  }
}

const addRangeLookup = (templateLibrary, lookups, lookupSubType, lookupKey, rangeLabel, rangeMin, rangeMax, value, userId, lookupSettings) => {
  const lookupType = Constants.lookupTypes.range;
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
    `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, undefined, lookupSubType, undefined, undefined, undefined, userId);
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupKey,
    `${Constants.hierarchyRoot}${lookupType}.${lookupSubType}`, lookupKey, undefined, lookupKey, undefined, undefined, undefined, userId);

  const name = `${rangeLabel} >= ${rangeMin} and < ${rangeMax}`;
  addLookup(templateLibrary, lookups, lookupType, lookupSubType, lookupKey, name, undefined, value,
    lookupSettings, undefined, undefined, userId);
};

const addOptionLookup = (templateLibrary, lookups, optionTypeName, optionValue, userId, effectiveDate) => {
  const lookupKey = optionTypeName;
  const lookupType = Constants.lookupTypes.option;
  const lookupSubType = Constants.lookupSubTypes.standard;
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupKey,
    `${Constants.hierarchyRoot}${lookupType}.${lookupSubType}`, lookupKey, undefined, lookupKey, undefined, undefined, undefined, userId);
  // console.log(`Adding option lookup key = '${lookupKey}', name = '${optionValue}'`);
  addLookup(templateLibrary, lookups, lookupType, lookupSubType, lookupKey, optionValue, undefined, optionValue,
    undefined, effectiveDate, undefined, userId);
};

const addProductSkuLookup = (templateLibrary, lookups, generalProductName, productSku, productName, productDescription, userId, lookupSettings) => {
  const lookupKey = generalProductName;
  const lookupType = Constants.lookupTypes.option;
  const lookupSubType = 'Product';
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
    `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, undefined, lookupSubType, undefined, undefined, undefined, userId);
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
    description: productDescription,
    value: productSku,
    lookupSettings,
    effectiveDate: new Date(),
    createdAt: new Date(),
    createdBy: userId,
  });
}

const addBasicLookup = (templateLibrary, lookups, lookupType, lookupSubType, key, name, description, value,
    lookupSettings, effectiveDate, expirationDate, userId) => {
  addLookup(templateLibrary, lookups, Constants.lookupTypes.hierarchical, Constants.lookupSubTypes.lookupSubType,
    `${Constants.hierarchyRoot}${lookupType}`, lookupSubType, undefined, lookupSubType, undefined, undefined, undefined, userId);
  addLookup(templateLibrary, lookups, lookupType, lookupSubType, key, name, description, value,
    lookupSettings, effectiveDate, expirationDate, userId);
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

const getDateStatusIconClassByStatus = (dateStatus) => {
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

const getDateStatusIconClass = (lookup) => {
  const dateStatus = getDateStatus(lookup);
  return getDateStatusIconClassByStatus(dateStatus);
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

const getDateStatusOptions = () => {
  return [
    {
      icon: "<span></span>",
      name: 'Any',
      ticked: false
    }, {
      dateStatusOption: Constants.dateStatusOptions.active,
      icon: `<i class="${getDateStatusIconClassByStatus(Constants.dateStatuses.effectiveInPastNoExpiration)}"></i>`,
      name: 'Active',
      ticked: true
    }, {
      dateStatusOption: Constants.dateStatusOptions.expired,
      icon: `<i class="${getDateStatusIconClassByStatus(Constants.dateStatuses.expired)}"></i>`,
      name: 'Expired',
      ticked: false
    }, {
      dateStatusOption: Constants.dateStatusOptions.effectiveInFuture,
      icon: `<i class="${getDateStatusIconClassByStatus(Constants.dateStatuses.effectiveInFutureWillExpire)}"></i>`,
      name: 'Effective In Future',
      ticked: false
    },
  ];
}

const getLookupSettingsSummary = (lookupSettings) => {
  return _.reduce(lookupSettings, (memo, setting) => `${memo}${memo.length ? ', ' : ''}${setting.key} ${setting.value}`, '');
}

LookupsHelper = {
  addBasicLookup,
  addLookup,
  addOptionLookup,
  addPriceLookup,
  addProductSkuLookup,
  addRangeLookup,
  getDateStatus,
  getDateStatusIconClass,
  getDateStatusText,
  getDateStatusTooltip,
  getIconStack1xClass,
  getIconStack2xClass,
  getLookupKeyOptions,
  getLookupValue,
  getLookupSettingsSummary,
  getLookupSubTypeOptions,
  getLookupTypeOptions,
  getDateStatusOptions,
  getSettingValue,
  isValidLookup,
}
