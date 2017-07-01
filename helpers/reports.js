export const getReportData = ({company, job, productSelections, subtotal}) => {
  const reportData = {
    productSelections,
  };
  reportData.company = {
    name: company.name,
    address: company.address
  };
  reportData.customer = {
      "name": job.customerProfile ? `${job.customerProfile.firstName} ${job.customerProfile.lastName}` : '',
      "address": job.customerProfile ? job.customerProfile.address : ''
  };
  reportData.job = {
      "id": job._id,
      "description": job.name,
      "createdAt": job.createdAt,
      "dueAt": job.dueAt,
      "estimator": job.estimatorProfile ? `${job.estimatorProfile.firstName} ${job.estimatorProfile.lastName}` : '',
  };
  reportData.subtotal = subtotal;
  return reportData;
};

ReportsHelper = {
  getReportData,
};
