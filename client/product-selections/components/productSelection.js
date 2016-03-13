(function () {
  'use strict';
  var controllerId = 'productSelection';
  angular.module('app').controller(controllerId,
    ['$modalInstance', '$scope', 'bid', productSelection]);

  function productSelection($modalInstance, $scope, bid) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.bid = bid;
    $scope.getSelectionSummary = getSelectionSummary;

    function cancel() {
      $modalInstance.dismiss('cancel');
    }

    function save() {
      $modalInstance.close();
    }

    function getSelectionSummary() {
      return bid.getSelectedProductDisplaySummary();
    }
  }
})();
