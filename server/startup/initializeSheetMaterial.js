// Should be called by initializeEverything.js
Initialization.initializeSheetMaterial = function (companyInfo) {
  let company = Companies.findOne({"_id": companyInfo.weMakeCabinets._id});
  let templateLibrary = TemplateLibraries.findOne({"name": "Cabinetry", "ownerCompanyId": company._id});

  let cherry = Materials.findOne({"name": "Cherry", "templateLibraryId": templateLibrary._id});
  if (!cherry && templateLibrary) {
    console.log(`adding cherry for company ${company._id} with templateLibrary ${templateLibrary._id}`);

    cherry = {
      templateLibraryId: templateLibrary._id,
      name: "Cherry",
      description: "Wood from Cherry tree",
      sku: "CHERRY",
    };
    cherry._id = Materials.insert(cherry);
  }
  let whiteMelamine = Materials.findOne({"name": "White Melamine", "templateLibraryId": templateLibrary._id});
  if (!whiteMelamine && templateLibrary) {
    console.log(`adding whiteMelamine for company ${company._id} with templateLibrary ${templateLibrary._id}`);

    whiteMelamine = {
      templateLibraryId: templateLibrary._id,
      name: "White Melamine",
      description: "White Melamine (Particle Board Core)",
      sku: "WHTMELAMINE",
    };
    whiteMelamine._id = Materials.insert(whiteMelamine);
  }

  let cherryPlywood = SheetMaterials.findOne({"name": "Cherry Plywood", "templateLibraryId": templateLibrary._id});
  if (!cherryPlywood && templateLibrary) {
    console.log(`adding cherryPlywood for company ${company._id} with templateLibrary ${templateLibrary._id}`);

    cherryPlywood = {
      templateLibraryId: templateLibrary._id,
      name: "Cherry Plywood",
      description: "Cherry Plywood",
      sku: "CHEPLY",
      coreMaterial: cherry,
      sheetMaterialOfferings: [
        //Some info taken from http://www.bairdbrothers.com/34-Cherry-Plywood-P4003.aspx
        {
          name: `3/4" Cherry Plywood`,
          description: `3/4" Cherry Hardwood Plywood is Good 2 Sides (G2S), grade A-1, and has a 7-Ply Veneer Core. 3/4" cherry plywood is plain sliced. 48.5" x 96.5" sheet size.`,
          sku: "3/4CHEPLY",
          density: 2.5,
          nominalThickness: 0.75, // 3/4"
          actualThickness: 0.71875, // 23/32"
          length: 96.5,
          width: 48.5,
          sheetMaterialPricings: [
            { // add a pricing that has expired to verify that it does not get used
              effectiveDate: moment().startOf('day').add(-1, 'years').toDate(),
              expirationDate: moment().startOf('day').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 0.10,
            }, { //This is the pricing that should be used
              effectiveDate: moment().startOf('day').toDate(),
              expirationDate: moment().startOf('day').add(1, 'years').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 65.00,
            }, { // add a pricing that has not gone into effect yet to verify that it does not get used
              effectiveDate: moment().startOf('day').add(1, 'years').toDate(),
              expirationDate: moment().startOf('day').add(2, 'years').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 99999.00,
            }
          ]
        }, {
          name: `1/4" Cherry Plywood`,
          description: `1/4 Cherry Hardwood Plywood Good 2 Sides (G2S), grade A-4, and has a MDF Core. 1/4" cherry plywood is plain slice. 48.5" x 96.5" sheet size.`,
          sku: "1/4CHEPLYG2S",
          density: 0.8325,
          nominalThickness: 0.25, // 1/4"
          actualThickness: 0.25, //By the normal rule should be 0.21875M, but saw somewhere that the actual thickness is 1/4"
          length: 96,
          width: 48,
          sheetMaterialPricings: [
            {
              effectiveDate: moment().startOf('day').toDate(),
              expirationDate: moment().startOf('day').add(1, 'years').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 50.00,
            }
          ]
        }
      ]
    };
    cherryPlywood._id = SheetMaterials.insert(cherryPlywood);
  }

  let whiteMelaminePlywood = SheetMaterials.findOne({"name": "White Melamine Plywood", "templateLibraryId": templateLibrary._id});
  if (!whiteMelaminePlywood && templateLibrary) {
    console.log(`adding whiteMelaminePlywood for company ${company._id} with templateLibrary ${templateLibrary._id}`);

    whiteMelaminePlywood = {
      templateLibraryId: templateLibrary._id,
      name: "White Melamine Plywood",
      description: "Melamine Plywood - White",
      sku: "WHTPLY",
      coreMaterial: whiteMelamine,
      sheetMaterialOfferings: [
        {
          name: `3/4" White Melamine Plywood`,
          description: `3/4" White Melamine (Particle Board Core, 48" x 96" sheet size).`,
          sku: "3/4WHTPLY",
          density: 3.1,
          nominalThickness: 0.75, // 3/4"
          actualThickness: 0.71875, // 23/32"
          length: 96,
          width: 48,
          sheetMaterialPricings: [
            { // add a pricing that has expired to verify that it does not get used
              effectiveDate: moment().startOf('day').add(-1, 'years').toDate(),
              expirationDate: moment().startOf('day').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 0.10,
            }, { //This is the pricing that should be used
              effectiveDate: moment().startOf('day').toDate(),
              expirationDate: moment().startOf('day').add(1, 'years').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 35.00,
            }, { // add a pricing that has not gone into effect yet to verify that it does not get used
              effectiveDate: moment().startOf('day').add(1, 'years').toDate(),
              expirationDate: moment().startOf('day').add(2, 'years').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 99999.00,
            }
          ]
        }, {
          name: `1/4" White Melamine Plywood`,
          description: `1/4 White Melamine (Particle Board Core, 48" x 96" sheet size).`,
          sku: "1/4WHTPLY",
          density: 1.0323,
          nominalThickness: 0.25, // 1/4"
          actualThickness: 0.25, //By the normal rule should be 0.21875M, but saw somewhere that the actual thickness is 1/4"
          length: 96,
          width: 48,
          sheetMaterialPricings: [
            {
              effectiveDate: moment().startOf('day').toDate(),
              expirationDate: moment().startOf('day').add(1, 'years').add(-1, 'days').toDate(),
              supplierId: company._id,
              purchasePricePerSheet: 28.00,
            }
          ]
        }
      ]
    };
    whiteMelaminePlywood._id = SheetMaterials.insert(whiteMelaminePlywood);
  }
}
