// when adding entries here, also update innermostFunctionCallFinder in replaceFunctionCalls
const easyBidFunctions = {
  lookup: {
    // Expecting lookupCall to be `lookup` followed by parentheses with 2-5 parameters. Expected parameters:
    //   1) valueToLookUp: the thing to look for, a lookup key for a price lookup or a lookup name for a product lookup (required)
    //   2) lookupType: one of "Price", "Option", "Hierarchical", etc. (required)
    //   3) lookupSubType: lookup subtype (not used with price lookups, required for all others)
    //   4) lookupKey: lookup key (not used with price lookups as valueToLookUp represents this, required for all others)
    //   5) lookupSetting: key of a lookup setting to return instead of the normal lookup value (not used with price lookups, optional for all others)
    // Valid examples:
    //   `lookup(_0_,_1_)` (_0_ and _1_ represent replacementsToRestore so could be like the next line)
    //   `lookup("EdgeBanding|.5mmPVC|ln-ft","Price")`
    //   `lookup ("DrawerSlides|StdEpoxy-26","Price")`
    //   `lookup(exteriorExposed,"Option","Product",".75 Case Material","Density")`
    //   `lookup(exteriorExposed,"Option","Product",".75 Case Material")`
    replaceCall: (bidControllerData, selection, lookupCall, selectionReferencingVariable, replacementsToRestore) => {
      const parseCall = () => {
        // expecting lookupCall like `lookup(exteriorExposed,"Option","Product",".75 Case Material", "Density")`
        const matchResults = lookupCall.match(/lookup\s*\((.*?)\)/);
        if (matchResults && matchResults.length > 1) {
          // return something like {lookupParameters: [`exteriorExposed`, `"Option"`, `"Product"`, `".75 Case Material"`, `"Density"`]}
          const lookupParameters = _.map(matchResults[1].split(','), (lookupParameter) => {
            // Now that parameters have been identified, it is safe to add back the replacement strings.
            return Strings.restoreReplacementsToRestore(lookupParameter.trim(), replacementsToRestore);
          });

          return {lookupParameters};
        }
        return {};
      };
      const {job, lookupData, metadata} = bidControllerData;
      let {lookupParameters} = parseCall(lookupCall);
      // Replace each parameter value if appropriate. Strings get quotes removed, template variables get variable values.
      // Examples (assuming exterior is template variable with value `Melamine`):
      // lookupCall                                   initial lookupParameters                     final lookupParameters
      // `lookup(exterior,"Option","Product",".75")`  [`exterior`,`"Option"`,`"Product"`,`".75"`]  [`Melamine`,`Option`,`Product`,`.75`]
      // `lookup("DrawerSlides|StdEpoxy-26","Price")` [`"DrawerSlides|StdEpoxy-26"`,`"Price"`]     [`DrawerSlides|StdEpoxy-26`,`Price`]
      for (let i = 0; i < lookupParameters.length; i++) {
        const lookupParameter = lookupParameters[i];
        if (lookupParameter[0] === `'` || lookupParameter[0] === `"`) {
          lookupParameters[i] = lookupParameter.substring(1, lookupParameter.length - 1)
        } else {
          const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(lookupParameter);
          if (jsonVariableName) {
            lookupParameters[i] = SelectionsHelper.getJsonVariableValue(bidControllerData, selection, jsonVariableName, selectionReferencingVariable);
          }
        }
      }
      const {lookupValue, lookupValueType} = LookupsHelper.getLookupValue(lookupData, job.pricingAt, ...lookupParameters);
      switch (lookupValueType) {
        case 'string':
          return `"${lookupValue || ''}"`;
        default:
          return `${lookupValue || 0}`;
      }
    },
  },
  squish: {
    // Expecting squishCall to be `squish` followed by parentheses with 1 or more parameters.
    replaceCall: (bidControllerData, selection, squishCall, selectionReferencingVariable, replacementsToRestore) => {
      const parseCall = () => {
        // expecting squishCall like `squish("Edge Banding",caseEdge,"ln-ft")` or `squish(_0_,caseEdge,_1_)`
        const matchResults = squishCall.match(/squish\s*\((.*?)\)/);
        if (matchResults && matchResults.length > 1) {
          // return something like {squishParameters: [`"Edge Banding"`,`caseEdge`,`"ln-ft"`]}
          const squishParameters = _.map(matchResults[1].split(','), (squishParameter) => {
            // Now that parameters have been identified, it is safe to add back the replacement strings.
            return Strings.restoreReplacementsToRestore(squishParameter.trim(), replacementsToRestore);
          });
          return {squishParameters};
        }
        return {};
      };
      const {job, lookupData, metadata} = bidControllerData;
      let {squishParameters} = parseCall(squishCall);
      // Replace each parameter value if appropriate. Strings get quotes removed, template variables get variable values.
      // Example (assuming caseEdge is template variable with value `.5mm PVC`):
      // squishCall                                 initial squishParameters                  final squishParameters
      // `squish("Edge Banding",caseEdge,"ln-ft")`  [`"Edge Banding"`,`caseEdge`,`"ln-ft"`]   [`Edge Banding`,`.5mm PVC`,`ln-ft`]
      for (let i = 0; i < squishParameters.length; i++) {
        const squishParameter = squishParameters[i];
        if (squishParameter[0] === `'` || squishParameter[0] === `"`) {
          squishParameters[i] = squishParameter.substring(1, squishParameter.length - 1)
        } else {
          const jsonVariableName = ItemTemplatesHelper.getJsonVariableNameByTemplateVariableName(squishParameter);
          if (jsonVariableName) {
            squishParameters[i] = SelectionsHelper.getJsonVariableValue(bidControllerData, selection, jsonVariableName, selectionReferencingVariable);
          }
        }
      }
      // from [`Edge Banding`,`.5mm PVC`,`ln-ft`] return something like `"EdgeBanding|.5mmPVC|ln-ft"`]
      return `"${Strings.squish(...squishParameters)}"`;
    }
  },
};

const replaceFunctionCall = (bidControllerData, selection, functionCall, selectionReferencingVariable, replacementsToRestore) => {
  const functionNameFinder = /(\w*)\s*\(.*\)/i;
  const matchInfo = functionCall.match(functionNameFinder);
  if (!matchInfo || matchInfo.length < 2) {
    return functionCall;
  }
  const functionName = matchInfo[1].toUpperCase();
  switch (functionName) {
    case 'LOOKUP':
      return easyBidFunctions.lookup.replaceCall(bidControllerData, selection, functionCall, selectionReferencingVariable, replacementsToRestore);
    case 'SQUISH':
      return easyBidFunctions.squish.replaceCall(bidControllerData, selection, functionCall, selectionReferencingVariable, replacementsToRestore);
    default:
      console.log(`unexpected function '${functionName}' call from '${functionCall}' in replaceFunctionCall`);
      return functionCall;
  }
}

// Replace each innermost function call one at a time, adjusting appropriately, until none exist.
// Example (assuming caseEdge is template variable with value `.5mm PVC` and door is `PLAM - 3mm PVC`):
// valueFormula:   (5.00+lookup("Price",squish("Edge Banding",caseEdge,"ln-ft"))+lookup("Price",squish("Door Banding",door,"ln-ft")))
// first matches:                       squish("Edge Banding",caseEdge,"ln-ft")                 squish("Door Banding",door,"ln-ft")
// first replace:                       "EdgeBanding|.5mmPVC|ln-ft"                             "DoorBanding|PLAM-3mmPVC|ln-ft"
// first result:   (5.00+lookup("Price","EdgeBanding|.5mmPVC|ln-ft")+lookup("Price","DoorBanding|PLAM-3mmPVC|ln-ft"))
// final matches:        lookup("Price","EdgeBanding|.5mmPVC|ln-ft") lookup("Price","DoorBanding|PLAM-3mmPVC|ln-ft")
// final replace:        0.10                                        0.47
// final result:   (5.00+0.10+0.47)
const replaceFunctionCalls = (bidControllerData, selection, valueFormula, selectionReferencingVariable) => {
	// We will keep track of result as we go based on this example:
	// valueFormula: (5.00+lookup("Price",squish("Edge Banding",caseEdge,"ln-ft"))+lookup("Price",squish("Door Banding",door,"ln-ft")))
  const replacementsToRestore = [];
  let result = valueFormula;

	// Remove all double quote string content so we don't accidentally replace it. Will add it back later.
	result = Strings.replaceQuotedStrings(result, replacementsToRestore, true);
  // result: (5.00+lookup(_0_,squish(_1_,caseEdge,_2_))+lookup(_3_,squish(_4_,door,_5_)))
  // change:              ^^^        ^^^          ^^^          ^^^        ^^^      ^^^
  // replacementsToRestore: [`"Price"`, `"Edge Banding"`, `"ln-ft"`, `"Price"`, `"Door Banding"`, `"ln-ft"`]

  // Finds parentheticals preceded with an easyBidFunction and without a '(' in them and then makes the replacement.
  // Examples: 'squish ("Edge Banding",caseEdge,"ln-ft")' but not 'lookup("Price",squish("Edge Banding",caseEdge,"ln-ft"))'
  const innermostFunctionCallFinder = /(?:lookup|squish)\s*\([^\(]*?\)/gi;
  let finished = false;
  while (!finished) {
    result = result.replace(innermostFunctionCallFinder, (functionCall) => {
      return replaceFunctionCall(bidControllerData, selection, functionCall, selectionReferencingVariable, replacementsToRestore);
    });
    // The previous replacement may have added quoted strings, so replace them again
    result = Strings.replaceQuotedStrings(result, replacementsToRestore, true);
    finished = !result.match(innermostFunctionCallFinder);
  }
  // result: (5.00+0.10+0.47)
  return Strings.restoreReplacementsToRestore(result, replacementsToRestore);
}

Formulas = {
  easyBidFunctions,
  replaceFunctionCalls,
}
