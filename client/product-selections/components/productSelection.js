(function () {
  'use strict';
  var controllerId = 'productSelection';
  angular.module('app').controller(controllerId,
    ['$modalInstance', '$scope', 'bid', 'pendingChanges', productSelection]);

  function productSelection($modalInstance, $scope, bid, pendingChanges) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.bid = bid;
    $scope.pendingChanges = pendingChanges;
    $scope.getSelectionSummary = getSelectionSummary;

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function save() {
      $modalInstance.close();
    }

    function getSelectionSummary() {
      return bid.getSelectedProductDisplaySummary($scope.pendingChanges);
    }
  }
})();
