const charIsDigit = (c) => {
  return !isNaN(parseInt(c, 10));
}

const camelCase = (text) => {
  // only include spaces, characters, and digits prior to splitting
  const textArray = text.replace(/[^a-z0-9 ]/gi,' ').trim().split(' ');
  return _.map(textArray, (item, index) => {
    if (index === 0) {
      return item.toLowerCase();
    }
    else {
      return item.length ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : '';
    }
  }).join('');
}

// Return text camelCased with prepended '_' if the first character is a digit
const toVariableName = (text) => {
  const variableName = camelCase(text.replace('#', ' num '));
  if (variableName && variableName.length && charIsDigit(variableName[0])) {
    return `_${variableName}`;
  }
  return variableName;
};

// with inputs like ['car key', 'House Key'] expect return like 'carkey|HouseKey'
const squish = (...inputs) => {
  return _.reduce(inputs, (memo, input) => {
    return `${memo}${memo.length > 0 ? '|' : ''}${input ? input.replace(/\s/g, '') : '[oops]'}`;
  }, '');
}

const getReplacementToken = (index) => {
  return `_${index}_`;
};

// replace items in quotes with replacement tokens
// Example formula: =IF(AND(P24="Yes",FJ27="Type 2",Z24<=7),4)
// Matches:                     "Yes"      "Type 2"
// Replacements:                _3_        _4_
// Result:          =IF(AND(P24==_3_,FJ27==_4_,Z24<=7),4)
const replaceQuotedStrings = (input, replacementsToRestore, useDoubleQuote) => {
	const stringExpression = useDoubleQuote ? /(".*?")/g : /('.*?')/g;
	return input.replace(stringExpression, (match) => {
    replacementsToRestore.push(match);
    return getReplacementToken(replacementsToRestore.length - 1);
  });
}

// Restore replaced strings. Needs to occur 1 at a time and in the opposite
// order of replacement creations as 1 replacement could contain another 1
// Example replacementsToRestore:
//   [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`, `P24==_0_ AND FJ24!=_1_ AND FF24==_3_`,
//   `(FA24||_2_)`, `(I24*J24)`, `(_4_?3:1)`, `Q24==_5_ OR FJ2>=11`, `(_8_?_6_/144:0)`]
// Example input: _7_+_9_
// Result after processing index
// 9: _7_+(_8_?_6_/144:0)
// 8: _7_+(Q24==_5_ OR FJ2>=11?_6_/144:0)
// 7: (_4_?3:1)+(Q24==_5_ OR FJ2>=11?_6_/144:0)
// 6: (_4_?3:1)+(Q24==_5_ OR FJ2>=11?(I24*J24)/144:0)
// 5: (_4_?3:1)+(Q24==(FA24||_2_) OR FJ2>=11?(I24*J24)/144:0)
// 4: (P24==_0_ AND FJ24!=_1_ AND FF24==_3_?3:1)+(Q24==(FA24||_2_) OR FJ2>=11?(I24*J24)/144:0)
// 3: (P24==_0_ AND FJ24!=_1_ AND FF24=='No'?3:1)+(Q24==(FA24||_2_) OR FJ2>=11?(I24*J24)/144:0)
// 2: (P24==_0_ AND FJ24!=_1_ AND FF24=='No'?3:1)+(Q24==(FA24||" ft") OR FJ2>=11?(I24*J24)/144:0)
// 1: (P24==_0_ AND FJ24!="Type 2" AND FF24=='No'?3:1)+(Q24==(FA24||" ft") OR FJ2>=11?(I24*J24)/144:0)
// 0: (P24=="Yes" AND FJ24!="Type 2" AND FF24=='No'?3:1)+(Q24==(FA24||" ft") OR FJ2>=11?(I24*J24)/144:0)
const restoreReplacementsToRestore = (input, replacementsToRestore) => {
  let result = input;
	for(let index = replacementsToRestore.length - 1;index >= 0; index--) {
    const replacementToken = getReplacementToken(index);
    // Each replacement should only occur once
    const tokenFinder = new RegExp(replacementToken);
		result = result.replace(tokenFinder, replacementsToRestore[index]);
	}
  return result;
}

Strings = {
  camelCase,
  charIsDigit,
  getReplacementToken,
  replaceQuotedStrings,
  restoreReplacementsToRestore,
  squish,
  toVariableName,
}
