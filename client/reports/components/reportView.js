(function () {
  'use strict';
  var controllerId = 'reportView';
  angular.module('app').controller(controllerId,
    ['$uibModalInstance', '$scope', 'bid', reportView]);

  function reportView($uibModalInstance, $scope, bid, reportContent) {
    $scope.cancel = cancel;
    $scope.save = save;
    $scope.getQuoteReport = getQuoteReport;
    $scope.bid = bid;
    $scope.reportContent = null;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close();
    }

    function getQuoteReport(forceGenerate) {
      $scope.reportContent = null;
      const bidControllerData = bid.getPendingChanges();
      const productSelections = [];
      bid.populateProductsForReport(productSelections, bidControllerData, bid.jobSelection, '');
      const salesTaxRate = bid.company.salesTaxRate || 0.05;
      const installPercentOfGrandTotal = bid.company.installPercentOfGrandTotal || 0.18;
      const subtotal = bid.subtotalSelections(bid.productSelectionIds, false);
      const salesTax = salesTaxRate * subtotal;
      const nontaxableInstallAmount =  ((subtotal + salesTax)/(1-installPercentOfGrandTotal/100))-(subtotal + salesTax);
      const grandTotal = subtotal + salesTax + nontaxableInstallAmount;
      const reportData = ReportsHelper.getReportData({
        company: bid.company,
        job: bidControllerData.job,
        productSelections,
        amounts: {subtotal, salesTax, nontaxableInstallAmount, grandTotal}
      });
      const reportTitle = bid.getQuoteReportTitle(reportData);
      const reportName = `${reportTitle}.pdf`;
      const jsReportOnlineId = Constants.jsReportOnlineIds.jobQuote;
      Meteor.call('getQuoteReport', bidControllerData, forceGenerate, jsReportOnlineId, reportData, reportName,
      (err, result) => {
        if (err) {
          console.log('failed to getQuoteReport', err);
        } else {
          console.log('getQuoteReport succeeded');
          var file = new Blob([result], {type: 'application/pdf'});
          var fileURL = URL.createObjectURL(file);
          bid.reportTitle = reportTitle;
          $scope.reportContent = bid.$sce.trustAsResourceUrl(fileURL);
          $scope.$digest();
        }
      });
    }

    getQuoteReport(false);
  }
})();
