angular.module("app").controller("company", ['$scope', '$meteor', '$rootScope', '$stateParams',
  function ($scope, $meteor, $rootScope, $stateParams) {
    var vm = this;
    vm.company = $meteor.object(Companies, $stateParams.companyId);

    initialize();

    function initialize () {
      var subscriptionHandle;
      $meteor.subscribe('companies').then(function (handle) {
        subscriptionHandle = handle;
      });

      $scope.$on('$destroy', function () {
        subscriptionHandle.stop();
      });
    }
  }]);
