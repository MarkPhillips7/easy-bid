(function () {
  'use strict';
  var controllerId = 'reportView';
  angular.module('app').controller(controllerId,
    ['$uibModalInstance', '$scope', 'bid', reportView]);

  function reportView($uibModalInstance, $scope, bid) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.bid = bid;
    // $scope.pendingChanges = pendingChanges;
    // $scope.getSelectionSummary = getSelectionSummary;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close();
    }

    // function getSelectionSummary() {
    //   return bid.getSelectedProductDisplaySummary($scope.pendingChanges);
    // }
  }
})();
