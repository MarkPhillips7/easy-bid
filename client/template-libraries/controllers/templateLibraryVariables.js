(function () {
  'use strict';
  var controllerId = 'templateLibraryVariables';
  angular.module('app').controller(controllerId,
      ['$uibModalInstance', '$reactive', '$scope', 'vm', templateLibraryVariables]);

  function templateLibraryVariables($uibModalInstance, $reactive, $scope, vm) {
    $reactive(this).attach($scope);

    $scope.vm = vm;
    $scope.close = close;
    this.vm = vm;
    this.close = close;

    function close() {
      $uibModalInstance.close();
    }
  }
})();
