// Should be called by initializeEverything.js
Initialization.initializeCompanies = function () {
  // Create a starting list of groups/companies (the name of these record will be used to identify the group with roles)
  var weMakeCabinets = {
    _id: "wHHJKRr2MhLdc4GkT",
    name: "We Make Cabinets",
    websiteUrl: "http://WeMakeCabinets.com",
    logoUrl: "http://we-make-cabinets.png"
  };
  var sheetMaterialRUs = {
    _id: "HQSXaGAuKohxZMySj",
    name: "Sheet Material R Us",
    websiteUrl: "http://sheetMaterialRUs.com",
    logoUrl: "http://sheet-material-r-us.png"
  };
  var companies = [weMakeCabinets, sheetMaterialRUs];

  _.each(companies, function (company) {
    var companyId = Companies.findOne({"_id": company._id});

    // If an existing company is not found, create it.
    if (!companyId) {
      companyId = Companies.insert({
        _id: company._id,
        name: company.name,
        websiteUrl: company.websiteUrl,
        logoUrl: company.logoUrl
      });
    }
  });

  return {
    companies: companies,
    sheetMaterialRUs: sheetMaterialRUs,
    weMakeCabinets: weMakeCabinets
  }
}