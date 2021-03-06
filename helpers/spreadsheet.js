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

const getCellRangeInfo = (cellRange) => {
  const cellMatches = cellRange.match(/^(\$?[A-Z]*\$?\d*):(\$?[A-Z]*\$?\d*)/);
  topLeftCell = cellMatches[1];
  bottomRightCell = cellMatches[2];
  const topLeftCellObject = SpreadsheetUtils.decode_cell(topLeftCell);
  const bottomRightCellObject = SpreadsheetUtils.decode_cell(bottomRightCell);
  return {
    columnCount: bottomRightCellObject.c - topLeftCellObject.c + 1,
    rowCount: bottomRightCellObject.r - topLeftCellObject.r + 1,
    startCellAddressString: topLeftCell,
  };
}

const cleanCellValue = (cellValue) => {
  if (typeof cellValue === 'string') {
    return cellValue.trim();
  }
  return cellValue;
}

const getWorksheetCell = (cellAddress, worksheet) => {
  if (cellAddress.c < 0 || cellAddress.r < 0) {
    console.log(`Cannot get invalid cell address r=${cellAddress.r}, c=${cellAddress.c}`);
    return 'oops';
  }
  const cell = encode_cell(cellAddress);
  return worksheet[cell];
}

const getCellAddressObject = (startCellAddress, offsetOptions) => {
  const {columnOffset, rowOffset} = offsetOptions;
  let includeColumnOffset = true;
  let includeRowOffset = true;
  if (typeof startCellAddress === 'string') {
    // only include offsets if no leading $. $A$1 should not include either offsets, A1 should include both.
    const fixedMatches = startCellAddress.match(/(\$)?[A-Z]*(\$)?\d*/);
    includeColumnOffset = fixedMatches.length <= 1 || fixedMatches[1] !== '$';
    includeRowOffset = fixedMatches.length <= 2 || fixedMatches[2] !== '$';
    startCellAddress = decode_cell(startCellAddress);
  }
  return {
    ...startCellAddress,
    c: startCellAddress.c + (includeColumnOffset ? (columnOffset || 0) : 0 ),
    r: startCellAddress.r + (includeRowOffset ? (rowOffset || 0) : 0 ),
  };
}

const getCellAddressString = (startCellAddress, offsetOptions) => {
  let columnDollarOrNot = '';
  let rowDollarOrNot = '';
  if (typeof startCellAddress === 'string') {
    // only include offsets if no leading $. $A$1 should not include either offsets, A1 should include both.
    const fixedMatches = startCellAddress.match(/(\$)?[A-Z]*(\$)?\d*/);
    columnDollarOrNot = fixedMatches.length > 1 && fixedMatches[1] || '';
    rowDollarOrNot = fixedMatches.length > 2 && fixedMatches[2] || '';
  }
  const cellObject = getCellAddressObject(startCellAddress, offsetOptions);
  return `${columnDollarOrNot}${encode_col(cellObject.c)}${rowDollarOrNot}${encode_row(cellObject.r)}`;
}

const getCellValue = (startCellAddress, worksheet, offsetOptions) => {
  const cellObject = getCellAddressObject(startCellAddress, offsetOptions);
  const worksheetCell = getWorksheetCell(cellObject, worksheet);
  return worksheetCell && cleanCellValue(worksheetCell.v);
}

const getCellFormula = (startCellAddress, worksheet, offsetOptions) => {
  const cellObject = getCellAddressObject(startCellAddress, offsetOptions);
  const worksheetCell = getWorksheetCell(cellObject, worksheet);
  return worksheetCell && worksheetCell.f;
}

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

// replace Excel-style AND/OR expression with Parser expression
// Example expression: AND(Q24="Yes",FJ24="Type 2",Z24>5)
// andOr match:        AND
// options match:          Q24="Yes",FJ24="Type 2",Z24>5
// Result:             Q24="Yes" AND FJ24="Type 2" AND Z24>5
const replaceAndOrExpression = (andOrExpression) => {
	const matchInfo = andOrExpression.match(/(AND|OR)\s*\((.*)\)/i);
  // console.log(`replaceAndOrExpression ${andOrExpression} ${matchInfo[0]} ${matchInfo[1]} ${matchInfo[2]}`);
  if (!matchInfo || matchInfo.length < 3) {
    return andOrExpression;
  }
	const andOr = matchInfo[1];
	const options = matchInfo[2].split(',');
	for(let index = 0;index < options.length; index++) {
		options[index] = options[index].trim();
	}
  // Since `x==5 AND y==3-1` has a different meaning
  // than `(x==5 AND y==3)-1` enclose result in parentheses
	return '(' + options.join(` ${andOr.toLowerCase()} `) + ')';
}

// replace Excel-style IFERROR([something],[something if the first thing failed]) with just [something]
// Example input:   IFERROR(VLOOKUP(FK24,lookup_doorbanding,4,FALSE),0)
// params match:       P24=="" AND FJ24!="" AND FF24=='',3,1
// Result:          (P24=="" AND FJ24!="" AND FF24==''?3:1)
const replaceIfErrorExpression = (ifErrorExpression) => {
  console.log(`ifErrorExpression '${ifErrorExpression}'`);
	const matchInfo = ifErrorExpression.match(/^IFERROR\s*\((.*)\)$/i);
	const ifErrorParametersString = matchInfo[1];
  const indexOfLastComma = ifErrorParametersString.lastIndexOf(',');

	return ifErrorParametersString.substring(0, indexOfLastComma);
}

// replace Excel-style IF([bool],[true],[false]) expression with Parser [bool] ? [true] : [false] expression
// Example input:   IF(P24=="" AND FJ24!="" AND FF24=='',3,1)
// params match:       P24=="" AND FJ24!="" AND FF24=='',3,1
// Result:          (P24=="" AND FJ24!="" AND FF24==''?3:1)
const replaceIfExpression = (ifExpression) => {
	const matchInfo = ifExpression.match(/^IF\s*\((.*)\)$/i);
	const ifParameters = matchInfo[1].split(',');
  const boolExpression = ifParameters[0].trim();
  const valueIfTrue = ifParameters[1].trim();
  const valueIfFalse = ifParameters.length > 2 ? ifParameters[2].trim() : 0;
  // Put result in parentheses for scenarios like if(x,y,z)+if(h,j,k)
  // because x ? y : z + h ? j : k evaluates differently than (x ? y : z) + (h ? j : k)
	return `(${boolExpression} ? ${valueIfTrue} : ${valueIfFalse})`;
}

// replace Excel-style SUM(thing1, thing2, thing3) expression with (thing1 + thing2 + thing3)
// Example input:            SUM(thing1, thing2, thing3)
// parens + params match:       (thing1, thing2, thing3)
// Result:                      (thing1 + thing2 + thing3)
const replaceSum= (sumExpression) => {
	const matchInfo = sumExpression.match(/^SUM\s*(\(.*\))$/i);
	const parenthesesAndParameters = matchInfo[1];
  return parenthesesAndParameters.replace(/,/g, ' +');
}

const getReplacementForVLookup = (vLookupParameters, workbook, workbookMetadata) => {
  let [valueToLookUp, rangeSource, columnNumber] = vLookupParameters;
  // columnNumber = Number(columnNumber);
  // console.log(`rangeSource '${rangeSource}', columnNumber '${columnNumber}'`);
  const importSetSource = _.find(workbookMetadata.importSets, (importSet) => importSet.vLookup
    && importSet.vLookup.definedName === rangeSource);
  if (!importSetSource) {
    return null;
  }

  const vLookupColumnNumberCase = importSetSource.vLookup.vLookupColumnNumberCases
    && importSetSource.vLookup.vLookupColumnNumberCases[columnNumber];
  if (vLookupColumnNumberCase) {
    const {conditionValue, conditionVariable, lookupType, lookupSubType, lookupSetting, replacement} = vLookupColumnNumberCase;
    if (replacement) {
      return replacement.replace(`{valueToLookUp}`, valueToLookUp);
    }
    const optionalLookupSettingText = lookupSetting ? `, "${lookupSetting}"` : '';
    switch (lookupType) {
      case Constants.lookupTypes.price:
        // want something like `lookup(squish([general-product-name],[value-to-look-up],[optional-condition-value]), [lookup-type])`
        // example: `lookup(squish("Door",doorStyle,"buyout"),"Price")`
        const optionalConditionValueText = conditionValue ? `, "${conditionValue}"` : conditionVariable ? `, ${conditionVariable}` : '';
        return `lookup(squish("${importSetSource.generalProductName}", ${valueToLookUp}${optionalConditionValueText}), "${lookupType}")`;
      case Constants.lookupTypes.basic:
        // want something like `lookup([value-to-look-up-representing-lookup-key], [lookup-type], [lookup-subtype], [optional-lookup-setting-key])`
        // examples: `lookup(markupLevel,"Basic","Markup")` or `lookup("Engineering","Basic","Labor Minutes", "Item")`
        return `lookup(${valueToLookUp}, "${lookupType}", "${lookupSubType}", "${importSetSource.generalProductName}"${optionalLookupSettingText})`;
      case Constants.lookupTypes.option:
        // want something like `lookup([value-to-look-up-representing-lookup-name], [lookup-type], [lookup-subtype], [lookup-key], [optional-lookup-setting-key])`
        // example: `lookup(doorStyle,"Option","Product","Door","Door Code")`
        return `lookup(${valueToLookUp}, "${lookupType}", "${lookupSubType}", "${importSetSource.generalProductName}"${optionalLookupSettingText})`;
      default:
        console.log(`Unexpected lookupType '${lookupType}' in vLookupColumnNumberCase`);
        return null;
    }
  }

  const worksheet = workbook.Sheets[importSetSource.sheet];
  const vLookupColumnOffset = importSetSource.vLookup.columnOffset || 0;
  const columnOffset = vLookupColumnOffset + Number(columnNumber);
  const {startCellAddressString} = getCellRangeInfo(importSetSource.cellRange);
  const templateName = getCellValue(startCellAddressString, worksheet, {columnOffset});
  if (!templateName || typeof templateName !== 'string') {
    console.log(`expecting something to be a variable name but got '${templateName}' for ${startCellAddressString} with columnOffset ${columnOffset}`);
    return null;
  }
  // console.log(`templateName '${templateName}'`);
  return Strings.toVariableName(templateName);
}

// replace Excel-style VLOOKUP
// Example input:   VLOOKUP($E24,spec_lookup,7,FALSE)
// params match:            $E24,spec_lookup,7,FALSE
// Result:          drawerBox
const replaceVLookup = (vLookupExpression, workbook, workbookMetadata) => {
  // console.log(`vLookupExpression = ${vLookupExpression}`);
	const matchInfo = vLookupExpression.match(/^VLOOKUP\s*\((.*)\)$/i);
	const vLookupParameters = matchInfo[1].split(',');
  if (vLookupParameters.length < 3) {
    console.log(`expecting at least 3 parameters to VLOOKUP but got '${vLookupExpression}'`);
    return vLookupExpression;
  }
  const replacement = getReplacementForVLookup(vLookupParameters, workbook, workbookMetadata);
  if (replacement) {
    return replacement;
  }
	return vLookupExpression;
}

const replaceParenthetical = (input, workbook, workbookMetadata) => {
  const functionNameFinder = /(\w*)\s*\(.*\)/i;
  const matchInfo = input.match(functionNameFinder);
  if (!matchInfo || matchInfo.length < 2) {
    return input;
  }
  const functionName = matchInfo[1].toUpperCase();
  switch (functionName) {
    case 'AND':
    case 'OR':
      return replaceAndOrExpression(input);
    case 'IF':
      return replaceIfExpression(input);
    case 'IFERROR':
      return replaceIfErrorExpression(input);
    case 'SUM':
      return replaceSum(input, workbook, workbookMetadata);
    case 'VLOOKUP':
      return replaceVLookup(input, workbook, workbookMetadata);
    default:
      // Excel functions usually supported by expression parser, but Parser expects lowercase
      const leftParenIndex = input.indexOf('(');
      return `${functionName.toLowerCase()}${input.substring(leftParenIndex)}`;
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
const replaceParentheticals = (input, replacementsToRestore, workbook, workbookMetadata) => {
  let result = input;
  // Finds parentheticals without a '(' in them and optionally starting with a word.
  // Examples: 'AND(P24==_0_,FJ24!=_1_,FF24==_3_)' or '(I24*J24)' but not 'OR(Q24==(FA24||_2_),FJ2>=11)'
  const innermostParentheticalFinder = /\w*\s*\([^\(]*?\)/gi;
  let finished = false;
  while (!finished) {
    result = result.replace(innermostParentheticalFinder, (match) => {
      replacementsToRestore.push(replaceParenthetical(match, workbook, workbookMetadata));
      return Strings.getReplacementToken(replacementsToRestore.length - 1);
    });
    finished = !result.match(innermostParentheticalFinder);
  }
  return result;
}

const shouldGetVariableNameForCellAddress = (cellAddress) => {
  const cellObject = getCellAddressObject(cellAddress, {});
  return encode_row(cellObject.r) === 24;
}

const getVariableNameForCellAddress = (cell, worksheet, formulaRowOffset) => {
  const templateName = getCellValue(cell, worksheet, {rowOffset: -formulaRowOffset});
  if (!templateName || typeof templateName !== 'string') {
    console.log(`expecting something to be a variable name but got '${templateName}' for ${cell}`);
    return cell;
  }
  return Strings.toVariableName(templateName);
}

const replaceCellAddress = (cellAddressMaybeWithSheetName, replacementsByCell,
  formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet) => {
  if (replacementsByCell[cellAddressMaybeWithSheetName.replace(/\$/g, '')]) {
    return replacementsByCell[cellAddressMaybeWithSheetName.replace(/\$/g, '')].replacement;
  }

  // Deal with special cases like template with name like `Sq. Ft. 3/4" Case parts (S1)`
  if (cellAddressMaybeWithSheetName === 'S1' || cellAddressMaybeWithSheetName === 'S2') {
    return cellAddressMaybeWithSheetName;
  }

  let replacement;
  const cellFinder = /(?:'(.*?)'!)?(\$?[A-Z]+\$?[0-9]+)/;
  const matchInfo = cellAddressMaybeWithSheetName.match(cellFinder);
  if (!matchInfo || matchInfo.length < 3) {
    return cellAddressMaybeWithSheetName;
  }
  const sheetName = matchInfo[1];
  const cellAddress = matchInfo[2];
  const worksheetToUse = sheetName ? workbook.Sheets[sheetName] : worksheet;
  if (shouldGetVariableNameForCellAddress(cellAddress)) {
    replacement = getVariableNameForCellAddress(cellAddress, worksheetToUse, formulaRowOffset);
  } else {
    // for now just return the value in that cell
    console.log(`just using cell value as a string for ${cellAddress}`);
    replacement = `"${getCellValue(cellAddress, worksheetToUse, {})}"`;
  }
  replacementsByCell[cellAddressMaybeWithSheetName.replace(/\$/g, '')] = {replacement};
  return replacement;
}

// Replace each cell address with the appropriate value or variableName
// Example input:   (P24==1 AND FJ24!=0 AND 'Price List'!$Z$6>5?3:1)
// matches:          P24        FJ24        'Price List'!$Z$6
// Result:          (numShelves=1 AND numDrawers!=0 AND 7.99>5?3:1)
const replaceCellAddresses = (input, replacementsByCell,
  formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet) => {
  // cell address examples: `'Price List'!$Z$6` or `FA24` or `$FA$24`
  const cellAddressFinder = /(?:'.*?'!)?\$?[A-Z]+\$?[0-9]+/g;
  return input.replace(cellAddressFinder, (match) => replaceCellAddress(match, replacementsByCell,
    formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet));
}

// Replace cell range with the appropriate values or variableNames joined by ' + ' (was going to be commas, but currently only supporting SUM)
// Example input:   P24:R24
// matches:         P24:R24                          (represents P24,Q24,R24)
// Result:          numShelves + numDrawers + numBoxes
const replaceCellRange = (cellRange, replacementsByCell,
  formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet) => {
  const {columnCount, rowCount, startCellAddressString} = getCellRangeInfo(cellRange);
  const valuesOrVariableNames = [];
  for (let rowOffset = 0;rowOffset < rowCount;rowOffset++) {
    for (let columnOffset = 0;columnOffset < columnCount;columnOffset++) {
      const cellAddressString = getCellAddressString(startCellAddressString, {columnOffset, rowOffset});
      const valueOrVariableName = replaceCellAddress(cellAddressString, replacementsByCell,
        formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet)
      valuesOrVariableNames.push(valueOrVariableName);
    }
  }
  return valuesOrVariableNames.join(' + ');
}

// Replace each cell range with the appropriate values or variableNames joined by ' + ' (was going to be commas, but currently only supporting SUM)
// Example input:   SUM(P24:R24)+SUM(X24:Z24)
// matches:             P24:R24      X24:Z24
// Result:          SUM(numShelves + numDrawers + numBoxes)+SUM(numSlides + numSwings + numSeesaws)
const replaceCellRanges = (input, replacementsByCell,
  formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet) => {
  const cellRangeFinder = /(\$?[A-Z]+\$?[0-9]+:\$?[A-Z]+\$?[0-9]+)/;
  return input.replace(cellRangeFinder, (match) => replaceCellRange(match, replacementsByCell,
    formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet));
}

const replaceCellAddressesInFormula = (inputFormula, replacementsByCell,
  formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook,
  worksheet, formulaCellAddressString, variableName) => {
    if (typeof inputFormula !== 'string') {
      throw 'inputFormula must be a string in replaceCellAddresses';
    }

  	// We will keep track of result as we go based on this example:
  	// inputFormula: (P24=="Yes" AND FJ24!="Type 2" AND FF24=='No'?3:1)+(Q24==(FA24||" ft") OR FJ2>=11?(I24*J24)/144:0)
    const replacementsToRestore = [];
  	let result = inputFormula;

  	// Remove all string content so we don't have to worry about accidentally replacing it. Will add it back later.
    // Start with double quotes since they might contain single quotes as apostrophes
  	result = Strings.replaceQuotedStrings(result, replacementsToRestore, true);
    // result: (P24==_0_ AND FJ24!=_1_ AND FF24=='No'?3:1)+(Q24==(FA24||_2_) OR FJ2>=11?(I24*J24)/144:0)
    // change:       ^^^           ^^^                                  ^^^
    // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`]
    // console.log(`1. ${result}`);

    // Not replacing single quotes since they are used in the cell addresses that contain sheet name

    result = replaceCellRanges(result, replacementsByCell,
      formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet);

    result = replaceCellAddresses(result, replacementsByCell,
      formulaRowOffset, calculationsMappings, subsetOverridesByColumnOffset, workbook, worksheet);

    // Now that conversions to Parser format are done it is safe to add back the replacement strings.
  	result = Strings.restoreReplacementsToRestore(result, replacementsToRestore);
    // result:
    // console.log(`${formulaCellAddressString} ${variableName} = ${result}`);
  	return result;
}

const excelFormulaToParserFormula = (excelFormula, workbook, workbookMetadata, formulaCellAddressString) => {
  if (typeof excelFormula !== 'string') {
    throw 'excelFormula must be a string in excelFormulaToParserFormula';
  }

	// With so much going on in this function we will keep track of result as we go based on this example:
	// excelFormula: =IF(AND(P24="Yes",FJ24<>"Type 2",FF24='No'),3,1)+IF(OR(Q24=(FA24&" ft"),FJ2>=11),(I24*J24)/144)
  const replacementsToRestore = [];
	let result = excelFormula;
  // result: =IF(AND(P24="Yes",FJ24<>"Type 2",FF24='No'),3,1)+IF(OR(Q24=(FA24&" ft"),FJ2>=11),(I24*J24)/144)
  console.log(`${formulaCellAddressString} excelFormula =    ${excelFormula}`);

	// Remove all string content so we don't have to worry about accidentally replacing it. Will add it back later.
  // Start with double quotes since they might contain single quotes as apostrophes
	result = Strings.replaceQuotedStrings(result, replacementsToRestore, true);
  // result: =IF(AND(P24=_0_,FJ24<>_1_,FF24='No'),3,1)+IF(OR(Q24=(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:             ^^^       ^^^                                 ^^^
  // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`]
  // console.log(`1. ${result}`);

  result = Strings.replaceQuotedStrings(result, replacementsToRestore, false);
  // result: =IF(AND(P24=_0_,FJ24<>_1_,FF24=_3_),3,1)+IF(OR(Q24=(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:                                ^^^
  // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`]
  // console.log(`2. ${result}`);

	result = replaceEqualWithDoubleEqual(result);
  // result: =IF(AND(P24==_0_,FJ24<>_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:             ^                   ^                    ^
  // console.log(`3. ${result}`);

  result = replaceExcelNotEqualWithParserNotEqual(result);
  // result: =IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24&_2_),FJ2>=11),(I24*J24)/144)
  // change:                      ^^
  // console.log(`4. ${result}`);

  result = replaceExcelStringConcatWithParserStringConcat(result);
  // result: =IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24||_2_),FJ2>=11),(I24*J24)/144)
  // change:                                                            ^^
  // console.log(`5. ${result}`);

  result = removeLeadingEqual(result);
  // result: IF(AND(P24==_0_,FJ24!=_1_,FF24==_3_),3,1)+IF(OR(Q24==(FA24||_2_),FJ2>=11),(I24*J24)/144)
  // change: ^
  // console.log(`6. ${result}`);

  result = replaceParentheticals(result, replacementsToRestore, workbook, workbookMetadata);
  // result: _7_+_9_
  // change: ^^^ ^^^
  // replacementsToRestore: [`"Yes"`, `"Type 2"`, `" ft"`, `'No'`, `P24==_0_ AND FJ24!=_1_ AND FF24==_3_`,
  //   `(FA24||_2_)`, `(I24*J24)`, `(_4_?3:1)`, `Q24==_5_ OR FJ2>=11`, `(_8_?_6_/144:0)`]
  // console.log(`7. ${result}`);

  // Now that conversions to Parser format are done it is safe to add back the replacement strings.
	result = Strings.restoreReplacementsToRestore(result, replacementsToRestore);
  // result: (P24=="Yes" AND FJ24!="Type 2" AND FF24=='No'?3:1)+(Q24==(FA24||" ft") OR FJ2>=11?(I24*J24)/144:0)
  // console.log(`parserFormula = ${result}`);
	return result;
}

SpreadsheetUtils = {
  decode_cell: decode_cell,
  decode_col: decode_col,
  decode_row: decode_row,
	encode_col: encode_col,
	encode_row: encode_row,
	encode_cell: encode_cell,
	// encode_range: encode_range,
	excelFormulaToParserFormula,
  getCellAddressObject,
  getCellAddressString,
  getCellValue,
  getCellFormula,
  getCellRangeInfo,
  replaceCellAddressesInFormula,
	split_cell: split_cell,

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
