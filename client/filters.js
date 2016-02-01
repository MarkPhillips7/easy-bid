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
