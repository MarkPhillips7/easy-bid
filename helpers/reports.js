export const getReportData = ({job, productSelections}) => {
  const reportData = {};
  const addProductSelectionToReportData = (productSelection) => {
    reportData.productSelections.push({
        "area": productSelection.areaText,
        "quantity": productSelection.varquantity,
        "product": productSelection.productText,
        "priceEach": Filters.unitsFilter(productSelection.varpriceeach, '$'),
        "priceTotal": Filters.unitsFilter(productSelection.varpricetotal, '$')
    });
  };
  reportData.customer = {
      "name": job.customerText,
      "address": job.customer ? job.customer.address : ''
  };
  reportData.job = {
      "id": job.id,
      "description": job.description,
      "dueDate": job.dueDate,
      "estimator": job.estimator ? job.estimator.fullName : ''
  };
  reportData.productSelections = [];
  productSelections.forEach(addProductSelectionToReportData);
  return reportData;
};

ReportsHelper = {
  getReportData,
};
