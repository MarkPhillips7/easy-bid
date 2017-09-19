(function () {
  'use strict';
  var controllerId = 'reportView';
  angular.module('app').controller(controllerId,
    ['$uibModalInstance', '$scope', 'bid', reportView]);

  function reportView($uibModalInstance, $scope, bid, reportContent) {
    $scope.cancel = cancel;
    $scope.emailCustomer = emailCustomer;
    $scope.save = save;
    $scope.getQuoteReport = getQuoteReport;
    $scope.getReportData = getReportData;
    $scope.bid = bid;
    $scope.reportContent = null;

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

    function save() {
      $uibModalInstance.close();
    }

    function emailCustomer() {
      const bidControllerData = bid.getPendingChanges();
      Meteor.call('sendQuoteReportEmail', bidControllerData, $scope.reportId, $scope.getReportData(bidControllerData));
    }

    function getReportData(bidControllerData) {
      const productSelections = [];
      bid.populateProductsForReport(productSelections, bidControllerData, bid.jobSelection, '');
      const salesTaxRate = bid.company.salesTaxRate || 0.05;
      const installPercentOfGrandTotal = bid.company.installPercentOfGrandTotal || 18;
      const subtotal = bid.subtotalSelections(bid.productSelectionIds, false);
      const salesTax = salesTaxRate * subtotal;
      const nontaxableInstallAmount =  ((subtotal + salesTax)/(1-installPercentOfGrandTotal/100))-(subtotal + salesTax);
      const grandTotal = subtotal + salesTax + nontaxableInstallAmount;
      return ReportsHelper.getReportData({
        company: bid.company,
        job: bidControllerData.job,
        productSelections,
        amounts: {
          subtotal,
          salesTax,
          nontaxableInstallAmount,
          grandTotal
        }
      });
    }

    function getQuoteReport(forceGenerate) {
      const bidControllerData = bid.getPendingChanges();
      $scope.reportContent = null;
      const reportData = $scope.getReportData(bidControllerData);
      const reportTitle = bid.getQuoteReportTitle(reportData);
      const reportName = `${reportTitle}.pdf`;
      const jsReportOnlineId = Constants.jsReportOnlineIds.jobQuote;
      Meteor.call('getQuoteReport', bidControllerData, forceGenerate, jsReportOnlineId, reportData, reportName,
      (err, result) => {
        if (err) {
          console.log('failed to getQuoteReport', err);
        } else {
          console.log('getQuoteReport succeeded');
          var file = new Blob([result.reportBody], {type: 'application/pdf'});
          var fileURL = URL.createObjectURL(file);
          bid.reportTitle = reportTitle;
          $scope.reportId = result.reportId;
          $scope.reportContent = bid.$sce.trustAsResourceUrl(fileURL);
          $scope.$digest();
        }
      });
    }

    getQuoteReport(false);
  }
})();
