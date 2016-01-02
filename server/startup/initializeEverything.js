Meteor.startup(function () {
  var companyInfo = Initialization.initializeCompanies();
  var userInfo = Initialization.initializeUsers(companyInfo);
  Initialization.initializeTemplates(companyInfo, userInfo);
  Initialization.initializeJobs(companyInfo, userInfo);
  Initialization.initializeSelections(companyInfo,userInfo);
});