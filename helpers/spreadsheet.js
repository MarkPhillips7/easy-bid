// Excerpt from https://github.com/SheetJS/js-xlsx/blob/53f7f6d9446ccd680c9b13992d6dcdccde49a8f6/bits/90_utils.js
// Was getting "Cannot find module 'jszip'"" error when trying to use XLSX in client code

function decode_row(rowstr) { return parseInt(unfix_row(rowstr),10) - 1; }
function encode_row(row) { return "" + (row + 1); }
function fix_row(cstr) { return cstr.replace(/([A-Z]|^)(\d+)$/,"$1$$$2"); }
function unfix_row(cstr) { return cstr.replace(/\$(\d+)$/,"$1"); }

function decode_col(colstr) { var c = unfix_col(colstr), d = 0, i = 0; for(; i !== c.length; ++i) d = 26*d + c.charCodeAt(i) - 64; return d - 1; }
function encode_col(col) { var s=""; for(++col; col; col=Math.floor((col-1)/26)) s = String.fromCharCode(((col-1)%26) + 65) + s; return s; }
function fix_col(cstr) { return cstr.replace(/^([A-Z])/,"$$$1"); }
function unfix_col(cstr) { return cstr.replace(/^\$([A-Z])/,"$1"); }

function split_cell(cstr) { return cstr.replace(/(\$?[A-Z]*)(\$?\d*)/,"$1,$2").split(","); }
function decode_cell(cstr) { var splt = split_cell(cstr); return { c:decode_col(splt[0]), r:decode_row(splt[1]) }; }
function encode_cell(cell) { return encode_col(cell.c) + encode_row(cell.r); }

const getReplacementToken(index) => {
  return `_${index}_`;
};

// replace '=' with '==' but not if '=' is the first character and don't replace '<=', '>=', or '!='
// Example formula: =IF(AND(P24="Yes",FJ27="Type 2",Z24<=7),4)
// Matches:                   4=         7=
// Replacements:              4==         7==
// Result:          =IF(AND(P24=="Yes",FJ27=="Type 2",Z24<=7),4)
const replaceEqualWithDoubleEqual = (input) => {
  return input.replace(/([^><!]=)/g, `$1=`);
}

// replace '<>' with '!='
// Example formula: =IF(AND(P24<>"Yes",FJ27<>"Type 2",Z24<=7),4)
// Matches:                    <>          <>
// Replacements:               !=          !=
// Result:          =IF(AND(P24!="Yes",FJ27!="Type 2",Z24<=7),4)
const replaceExcelNotEqualWithParserNotEqual = (input) => {
  return input.replace(/(<>)/g, `!=`);
}


// replace '&' with '||'
// Example formula: =IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24&_2_),FJ2>=11),(I24*J24)/144)
// Matches:                                                                    &
// Replacements:                                                               ||
// Result:          =IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24||_2_),FJ2>=11),(I24*J24)/144)
const replaceExcelStringConcatWithParserStringConcat = (input) => {
  return input.replace(/(&)/g, `||`);
}

const removeLeadingEqual = (input) => {
  if (input.length > 0 && input[0] === '=') {
    return input.substring(1);
  }
  return input;
}

// // replace items in quotes with empty quotes
// // Example formula: =IF(AND(P24="Yes",FJ27="Type 2",Z24<=7),4)
// // Matches:                     "Yes"      "Type 2"
// // Replacements:                ""         ""
// // Result:          =IF(AND(P24=="",FJ27=="",Z24<=7),4)
// const replaceQuotedStringsWithEmptyStrings = (input, useDoubleQuote) => {
// 	const stringExpression = useDoubleQuote ? /(".*?")/g : /('.*?')/g;
// 	const replacement = useDoubleQuote ? `""` : `''`;
// 	let match;
// 	const originalStrings = [];
// 	const result = input.replace(stringExpression, replacement);
// 	while (match = stringExpression.exec(input)) {
// 		originalStrings.push(match[1]);
// 	}
// 	return {originalStrings, result};
// }

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

// // replace empty quotes with originalStrings values (length should match empty quotes count)
// // Example originalStrings: ["Yes", "Type 2"]
// // Example formula: P24="" AND FJ27="" AND Z24<=7 ? 4 : 0
// // Matches:             ""          ""
// // Replacements:        "Yes"       "Type 2"
// // Result:          P24="Yes" AND FJ27="Type 2" AND Z24<=7 ? 4 : 0
// const replaceEmptyStringsWithOriginalStrings = (input, originalStrings, useDoubleQuote) => {
// 	const stringExpression = useDoubleQuote ? /("")/g : /('')/g;
// 	let index = 0;
// 	return input.replace(stringExpression, (match) => {
// 		return originalStrings[index++];
// 	});
// }

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

// replace Excel-style AND/OR expression with Parser expression
// Example expression: AND(Q24="Yes",FJ24="Type 2",Z24>5)
// andOr match:        AND
// options match:          Q24="Yes",FJ24="Type 2",Z24>5
// Result:             Q24="Yes" AND FJ24="Type 2" AND Z24>5
const replaceAndOrExpression = (andOrExpression) => {
	const matchInfo = andOrExpression.match(/(AND|OR)\s*\((.*)\))/gi);
	const andOr = matchInfo[1];
	const options = matchInfo[2].split(',');
	for(let index = 0;index < options.length; index++) {
		options[index] = options[index].trim();
	}
	return options.join(` ${andOr} `);
}

// // replace Excel-style AND/OR expressions with Parser expressions
// // Example formula: =IF(AND(P24="Yes",FJ27="Type 2"),4)+IF(AND(Q24="Yes",FJ24="Type 2",Z24>5),3)
// // Matches:             AND(P24="Yes",FJ27="Type 2")       AND(Q24="Yes",FJ24="Type 2",Z24>5)
// // Replacements:        P24="Yes" AND FJ27="Type 2"        Q24="Yes" AND FJ24="Type 2" AND Z24>5
// // Result:          =IF(P24="Yes" AND FJ27="Type 2",4)+IF(Q24="Yes" AND FJ24="Type 2" AND Z24>5,3)
// const replaceAndOrExpressions = (input) => {
// 	const stringExpression = useDoubleQuote ? /(".*?")/g : /('.*?')/g;
// 	const replacement = useDoubleQuote ? `""` : `''`;
// 	let match;
// 	const originalStrings = [];
// 	const result = input.replace(/((AND|OR)\s*\(.*?\))/gi, replaceAndOrExpression);
// 	while (match = stringExpression.exec(input)) {
// 		originalStrings.push(match[1]);
// 	}
// 	return {originalStrings, result};
// }

// replace Excel-style IF([bool],[true],[false]) expression with Parser [bool] ? [true] : [false] expression
// Example input:   IF(P24=="" AND FJ24!="" AND FF24=='',3,1)
// params match:       P24=="" AND FJ24!="" AND FF24=='',3,1
// Result:          (P24=="" AND FJ24!="" AND FF24==''?3:1)
const replaceIfExpression = (ifExpression) => {
	const matchInfo = ifExpression.match(/^IF\s*\((.*)\)$/i);
	const ifParameters = matchInfo[1].split(',');
  const boolExpression = ifParameters[0];
  const valueIfTrue = ifParameters[1];
  const valueIfFalse = ifParameters.length > 2 ? ifParameters[2] : 0;
  // Put result in parentheses for scenarios like if(x,y,z)+if(h,j,k)
  // because x ? y : z + h ? j : k evaluates differently than (x ? y : z) + (h ? j : k)
	return `(${boolExpression})?${valueIfTrue}:${valueIfFalse}`);
}

// // replace Excel-style IF([bool],[true],[false]) expressions with Parser [bool] ? [true] : [false] expressions
// // Example input:   IF(P24=="" AND FJ24!="" AND FF24=='',3,1)+IF(Q24=="" OR FJ2>=11,(I24*J24)/144)
// // Matches:         IF(P24=="" AND FJ24!="" AND FF24=='',3,1) IF(Q24=="" OR FJ2>=11,(I24*J24)/144)
// // Replacements:    (P24=="" AND FJ24!="" AND FF24==''?3:1)    (Q24=="" OR FJ2>=11?(I24*J24)/144):0)
// // Result:          (P24=="" AND FJ24!="" AND FF24==''?3:1)+(Q24=="" OR FJ2>=11?(I24*J24)/144):0)
// const replaceIfExpressions = (input) => {
// 	const stringExpression = useDoubleQuote ? /(".*?")/g : /('.*?')/g;
// 	const replacement = useDoubleQuote ? `""` : `''`;
// 	let match;
// 	const originalStrings = [];
// 	const result = input.replace(/((AND|OR)\s*\(.*?\))/gi, replaceIfExpression);
// 	while (match = stringExpression.exec(input)) {
// 		originalStrings.push(match[1]);
// 	}
// 	return {originalStrings, result};
// }

const replaceParenthetical = (input) => {
  const functionNameFinder = /(\w)\s*\(.*\))/i;
  const matchInfo = input.match(functionFinder);
  if (!matchInfo || matchInfo.length < 2) {
    return input;
  }
  const functionName = matchInfo[1].toUpperString();
  switch (functionName) {
    case 'AND':
    case 'OR':
      return replaceAndOrExpression(input);
    case 'IF':
      return replaceIfExpression(input);
    default:
      return input;
  }
}

// Replace each innermost parenthetical one at a time, adjusting appropriately,  until none exist
// Example initial replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`]
// Example input:   IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24||_2_),FJ2>=11),(I24*J24)/144)
// first matches:      AND(P24==_0_,FJ24!=_1_,FF24==_3_)                 (FA24||_2_)          (I24*J24)
// first result:    IF(_4_,3,1)+IF(OR(Q24==_5_,FJ2>=11),_6_/144)
// next matches:    IF(_4_,3,1)    OR(Q24==_5_,FJ2>=11)
// next result:     _7_+IF(_8_,_6_/144)
// final match:         IF(_8_,_6_/144)
// final result:    _7_+_9_
// final replacementsToRestore:
//   [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`, `P24==_0_ AND FJ24!=_1_ AND FF24==_3_`,
//   `(FA24||_2_)`, `(I24*J24)`, `(_4_?3:1)`, `Q24==_5_ OR FJ2>=11`, `_8_?_6_/144:0`]
const replaceParentheticals = (input, replacementsToRestore) => {
  let result = input;
  // Finds parentheticals without a '(' in them and optionally starting with a word.
  // Examples: 'AND(P24==_0_,FJ24!=_1_,FF24==_3_)' or '(I24*J24)' but not 'OR(Q24==(FA24||_2_),FJ2>=11)'
  const innermostParentheticalFinder = /(\w)\s*(\([^\(]*?\))/gi;
  let finished = false;
  while (!finished) {
    result = result.replace(innermostParentheticalFinder, (match) => {
      replacementsToRestore.push(replaceParenthetical(match));
      return getReplacementToken(replacementsToRestore.length - 1);
    });
  }
}

const excelFormulaToParserFormula = (excelFormula) => {
	// With so much going on in this function we will keep track of result as we go based on this example:
	// excelFormula: =IF(AND(P24="Yes",FJ24<>"Type 2",FF24='No'),3,1)+IF(OR(Q24=(FA24&" ft"),FJ2>=11),(I24*J24)/144)
  const replacementsToRestore = [];
	let result = excelFormula;
  // result: =IF(AND(P24="Yes",FJ24<>"Type 2",FF24='No'),3,1)+IF(OR(Q24=(FA24&" ft"),FJ2>=11),(I24*J24)/144)

	// Remove all string content so we don't have to worry about accidentally replacing it. Will add it back later.
  // Start with double quotes since they might contain single quotes as apostrophes
	result = replaceQuotedStrings(result, replacementsToRestore, true);
  // result: =IF(AND(P24=_0_,FJ24<>_1_,FF24='No'),3,1)+IF(OR(Q24=(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:             ^^^       ^^^                                 ^^^
  // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`]

  result = replaceQuotedStrings(result, replacementsToRestore, false);
  // result: =IF(AND(P24=_0_,FJ24<>_1_,FF24=_3_),3,1)+IF(OR(Q24=(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:                                ^^^
  // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`]

	result = replaceEqualWithDoubleEqual(result);
  // result: =IF(AND(P24==_0_,FJ24<>_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:             ^                   ^                    ^

  result = replaceExcelNotEqualWithParserNotEqual(result);
  // result: =IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:                      ^^

  result = replaceExcelStringConcatWithParserStringConcat(result);
  // result: =IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24||_2_),FJ2>=11),(I24*J24)/144)
  // change:                                                            ^^

  result = removeLeadingEqual(result);
  // result: IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24||_2_),FJ2>=11),(I24*J24)/144)
  // change: ^

  result = replaceParentheticals(result, replacementsToRestore);
  // result: _7_+_9_
  // change: ^^^ ^^^
  // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`, `P24==_0_ AND FJ24!=_1_ AND FF24==_3_`,
  //   `(FA24||_2_)`, `(I24*J24)`, `(_4_?3:1)`, `Q24==_5_ OR FJ2>=11`, `(_8_?_6_/144:0)`]

  // Now that conversions to Parser format are done it is safe to add back the replacement strings.
	result = restoreReplacementsToRestore(result, replacementsToRestore);
  // result: (P24=="Yes" AND FJ24!="Type 2" AND FF24=='No'?3:1)+(Q24==(FA24||" ft") OR FJ2>=11?(I24*J24)/144:0)
	return result;
}

SpreadsheetUtils = {
	encode_col: encode_col,
	encode_row: encode_row,
	encode_cell: encode_cell,
	// encode_range: encode_range,
	excelToParserFormula,
	decode_col: decode_col,
	decode_row: decode_row,
	split_cell: split_cell,
	decode_cell: decode_cell,
	// decode_range: decode_range,
	// format_cell: format_cell,
	// get_formulae: sheet_to_formulae,
	// make_csv: sheet_to_csv,
	// make_json: sheet_to_json,
	// make_formulae: sheet_to_formulae,
	// sheet_to_csv: sheet_to_csv,
	// sheet_to_json: sheet_to_json,
	// sheet_to_formulae: sheet_to_formulae,
	// sheet_to_row_object_array: sheet_to_row_object_array
};
