export const getReportData = ({company, job, productSelections, amounts}) => {
  const reportData = {
    productSelections,
  };
  reportData.company = {
    name: company.name,
    address: company.address,
    phoneNumber: company.phoneNumber,
    logoUrl: company.logoUrl,
    websiteUrl: company.websiteUrl,
  };
  reportData.customer = {
      "name": job.customerProfile ? `${job.customerProfile.firstName} ${job.customerProfile.lastName}` : '',
      "address": job.customerProfile ? job.customerProfile.address : ''
  };
  reportData.job = {
      "id": job._id,
      "description": job.name,
      "createdAt": job.createdAt,
      "modifiedAt": job.modifiedAt,
      "dueAt": job.dueAt,
      "estimator": job.estimatorProfile ? `${job.estimatorProfile.firstName} ${job.estimatorProfile.lastName}` : '',
      "exclusions": job.exclusions,
      "provisions": job.provisions,
      "estimatedLeadTime": `4 - 6 weeks from approval of shop drawings.  2 - 3 weeks required for shop drawings.`,
      "acknowledgments": `Arch. Drawings dated XXXX
Specifications dated XXX
Addendums XXXX`,
  };
  const {subtotal, salesTax, nontaxableInstallAmount, grandTotal} = amounts;
  reportData.subtotal = subtotal;
  reportData.salesTax = salesTax;
  reportData.nontaxableInstallAmount = nontaxableInstallAmount;
  reportData.grandTotal = grandTotal;
  return reportData;
};

ReportsHelper = {
  getReportData,
};
