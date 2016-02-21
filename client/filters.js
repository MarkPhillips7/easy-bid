Filters.unitsFilter = (input, unitsText) => {
  if (unitsText === '$') {
    let inputAsDecimal;
    if (typeof input === 'number') {
      inputAsDecimal = input.toFixed(2);
    } else if (typeof input === 'string') {
      inputAsDecimal = input.length > 0 ? Number(input).toFixed(2) : '0.00';
    }
    return `$${inputAsDecimal}`;
  } else if (unitsText) {
    return input + ' ' + unitsText;
  } else {
    return input;
  }
};

angular.module('app')
  .filter('capitalize', ['$filter', function ($filter) {
    return function (input) {
      return input && input.charAt(0).toUpperCase() + input.slice(1);
    };
  }])
  .filter('ebunitsfilter', ['$filter', function ($filter) {
    return function (input, unitsText) {
      if (unitsText === '$') {
          return $filter('currency')(input);
      }
      else if (unitsText){
          return input + ' ' + unitsText;
      }
      else {
          return input;
      }
    };
  }]);
