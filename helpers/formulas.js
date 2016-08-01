const findLookups = (valueFormula) => {
  if (!valueFormula) {
    return null;
  }

  // expecting valueFormula like `3 * getLookup${lookupType}(${lookupKey})`, for example `getLookupPrice(drawerSlides)`
  const regularExpression = /getLookup[A-Za-z]+\([A-Za-z]+\)/g;
  return valueFormula.match(regularExpression);
}

const parseLookupInfo = (lookupMatch) => {
  // expecting lookupMatch like `getLookup${lookupType}(${lookupKey})`, for example `getLookupPrice(drawerSlides)`
  const matchResults = lookupMatch.match(/getLookup([A-Za-z]+)\(([A-Za-z]+)\)/);
  if (matchResults && matchResults.length > 2) {
    // want to return something like {lookupType: 'Price', templateVariableName: 'drawerSlides'}
    return {
      lookupType: matchResults[1],
      templateVariableName: matchResults[2]
    };
  }
  return {};
}

Formulas = {
  findLookups,
  parseLookupInfo,
}
