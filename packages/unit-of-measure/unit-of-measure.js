//Want something like this: 'm kg / s' (from '[Meters][unitSeparator][Kilograms][numeratorDenominatorSeparator][Seconds]'
var unitSeparator = ' ';
var numeratorDenominatorSeparator = ' / ';

var units = {
  //There should be no "square" entries like square feet. If square feet is needed there would be 2 NumeratorUnit settings of Feet
  inches: "Inches",
  feet: "Feet",
  seconds: "Seconds",
  minutes: "Minutes",
  hours: "Hours",
  dollars: "Dollars",
  partCount: "PartCount"
};

var unitAbbreviationMapper = [
  {
    unit: units.dollars,
    abbreviation: '$'
  },
  {
    unit: units.seconds,
    abbreviation: 'sec'
  },
  {
    unit: units.minutes,
    abbreviation: 'min'
  },
  {
    unit: units.hours,
    abbreviation: 'hr'
  },
  {
    unit: units.partCount,
    abbreviation: ''
  },
  {
    unit: units.inches,
    abbreviation: 'in'
  },
  {
    unit: units.feet,
    abbreviation: 'ft'
  }];

var unitOptions = getUnitOptions();

UnitOfMeasure = {
  formatCurrency: formatCurrency,
  getUnitOfMeasureText: getUnitOfMeasureText,
  unitOptions: unitOptions,
  units: units
};

function formatCurrency(value) {
  if (!value) {
    value = 0;
  }

  return "$" + value.toFixed(2);
}

function getUnitOptions() {
  var options = [];

  unitAbbreviationMapper.forEach(function (unit) {
    options.push({
      value: unit.unit,
      name: unit.unit + ' (' + unit.abbreviation + ')'
    });
  });

  return options;
}

//Want something like 'm kg / s'
//Where numeratorUnits = ['Meters', 'Kilograms'] and denominatorUnits= ['Seconds']
function getUnitOfMeasureText(numeratorUnits, denominatorUnits) {
  var numeratorText = getUnitOfMeasureTextByUnits(numeratorUnits);
  var denominatorText = getUnitOfMeasureTextByUnits(denominatorUnits);

  if (denominatorText.length > 0) {
    return numeratorText + numeratorDenominatorSeparator + denominatorText;
  }

  return numeratorText;
};

function getUnitAbbreviation(unit) {
  var unitAbbreviation = unit;

  unitAbbreviationMapper.forEach(function (mapping) {
    if (unit === mapping.unit) {
      unitAbbreviation = mapping.abbreviation;
    }
  });

  return unitAbbreviation;
};

function getUnitOfMeasureTextByUnits(units) {
  var text = '';
  var unitAbbreviation;

  if (units) {
    var uniqueUnits = [];
    var unitsWithCounts = {};
    units.sort().forEach(function (unit) {
      if (_.indexOf(uniqueUnits, unit) !== -1) {
        unitsWithCounts[unit]++;
      }
      else {
        uniqueUnits.push(unit);
        unitsWithCounts[unit] = 1;
      }
    });

    uniqueUnits.forEach(function (unit) {
      unitAbbreviation = getUnitAbbreviation(unit);
      if (text.length > 0) {
        text += unitSeparator;
      }
      text += unitAbbreviation;

      if (unitsWithCounts[unit] > 1) {
        text += '<sup>' + unitsWithCounts[unit] + '</sup>';
      }

      ////Be sure to use unitSeparator to avoid false positive (don't want search for m to find mm)
      //var indexOfExistingUnitAbbreviation = (unitSeparator + text).indexOf(unitSeparator + unitAbbreviation);
      //if (indexOfExistingUnitAbbreviation > -1) {
      //    var indexJustAfterUnitAbbreviation = indexOfExistingUnitAbbreviation + unitAbbreviation.length;
      //    if (text.slice(indexJustAfterUnitAbbreviation, indexJustAfterUnitAbbreviation + '<sup>'.length) === '<sup>') {
      //        var indexOfSuperscriptCloseTag = text.indexOf('</sup>', indexOfExistingUnitAbbreviation);
      //        var indexOfUnitExponent = indexJustAfterUnitAbbreviation + '<sup>'.length;

      //        //Set unitExponent to current exponent + 1
      //        var unitExponent = parseInt(text.slice(indexOfUnitExponent, indexOfSuperscriptCloseTag)) + 1;

      //        //Replace just the existing exponent with the new one
      //        text = text.slice(0, indexOfUnitExponent) + unitExponent + text.slice(indexOfSuperscriptCloseTag);
      //    }
      //    else {
      //        //Add a 2 exponent to the existing unit abbreviation
      //        text = text.slice(0, indexJustAfterUnitAbbreviation) + '<sup>2</sup>' + text.slice(indexJustAfterUnitAbbreviation);
      //    }
      //}
      //else {
      //    if (text.length > 0) {
      //        text += unitSeparator;
      //    }
      //    text += unitAbbreviation;
      //}
    });
  }

  return text;
}
