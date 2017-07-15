(function () {
  'use strict';
  var controllerId = 'reportView';
  angular.module('app').controller(controllerId,
    ['$uibModalInstance', '$scope', 'bid', reportView]);

  function reportView($uibModalInstance, $scope, bid, reportContent) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.bid = bid;
    $scope.reportContent = bid.reportContent;
    // $scope.pendingChanges = pendingChanges;
    // $scope.getSelectionSummary = getSelectionSummary;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close();
    }

    $scope.$watch('bid.reportContent', function (newValue, oldValue, scope) {
      scope.reportContent = newValue;
    }, true);
    // function getSelectionSummary() {
    //   return bid.getSelectedProductDisplaySummary($scope.pendingChanges);
    // }
  }
})();
