(function () {
  'use strict';
  var controllerId = 'productSelection';
  angular.module('app').controller(controllerId,
    ['$uibModalInstance', '$scope', 'bid', 'pendingChanges', productSelection]);

  function productSelection($uibModalInstance, $scope, bid, pendingChanges) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.bid = bid;
    $scope.pendingChanges = pendingChanges;
    $scope.getSelectionSummary = getSelectionSummary;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close();
    }

    function getSelectionSummary() {
      return bid.getSelectedProductDisplaySummary($scope.pendingChanges);
    }
  }
})();
