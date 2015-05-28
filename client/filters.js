angular.module('app')
    .filter('capitalize', ['$filter', function ($filter) {
    return function (input) {
        return input && input.charAt(0).toUpperCase() + input.slice(1);
    };
}]);