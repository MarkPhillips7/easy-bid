// Should be called by initializeEverything.js
Initialization.initializeJobs = function (companyInfo, userInfo) {
  let company = Companies.findOne({"_id": companyInfo.weMakeCabinets._id});
  let estimator = Roles.getUsersInRole([Config.roles.user], company._id).fetch()[0];
  let customer = Roles.getUsersInRole([Config.roles.customer], company._id).fetch()[0];
  let templateLibrary = TemplateLibraries.findOne({"name": "Cabinetry", "ownerCompanyId": company._id});

  let job = Jobs.findOne({"name": "Garage", "companyId": company._id});
  if (!job && estimator && customer && templateLibrary) {
    console.log(`adding job for company ${company._id} with estimator ${estimator} and customer ${customer} and templateLibrary ${templateLibrary._id}`);

    job = {
      name: "Garage",
      address: customer.profile.address,
      description: "Garage cabinets and workbench",
      notes: "May be raccoon living in the garage",
      provisions: "Payment terms: 50% deposit, balance due upon completion",
      exclusions: "Stone and glass tops (unless listed above), all plumbing and bath fixtures, electrical equipment, any wood trim not listed above, bonds, demolition, electrical work, plumbing work, appliances, rough carpentry, in-wall blocking.",
      company: company,
      companyId: company._id,
      customerProfile: customer.profile,
      customerId: customer._id,
      createdAt: new Date(),
      pricingAt: new Date(),
      dueAt: moment().add(7, 'days').toDate(),
      estimatorProfile: estimator.profile,
      estimatorId: estimator._id
    };
    var jobId = Jobs.insert(job);

    let jobTemplateLibrary = {
      jobId: jobId,
      templateLibraryId: templateLibrary._id
    }
    JobsTemplateLibraries.insert(jobTemplateLibrary);
  }
}
