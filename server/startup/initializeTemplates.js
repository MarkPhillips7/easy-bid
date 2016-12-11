import XLSX from 'xlsx';

// Should be called by initializeEverything.js
Initialization.initializeTemplates = function(companyInfo, userInfo) {
  const initializeBidModelTemplateLibrary = () => {
    var templateLibrary = {
      name: "Bid Model",
      description: "Bid Model",
      isReadOnly: true,
      isPublic: true,
      //imageUrl: templateLibrary.websiteUrl,
      //ownerCompanyId:
      createdBy: userInfo.systemAdminUserId,
      templates: [],
      templateRelationships: []
    };

    var templateCompany = {
      id: Random.id(),
      name: "Company",
      description: "Company that provides service",
      templateType: Constants.templateTypes.company,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableCollector, value: "true"
      }]
    };
    templateLibrary.templates.push(templateCompany);

    var templateCustomer = {
      id: Random.id(),
      name: "Customer",
      description: "Customer requesting a bid",
      templateType: Constants.templateTypes.customer,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableCollector, value: "true"
      }]
    };
    templateLibrary.templates.push(templateCustomer);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateCustomer.id
    });

    var templateJob = {
      id: Random.id(),
      name: "Job",
      description: "The job or project being bid",
      templateType: Constants.templateTypes.job,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableCollector, value: "true"
      }]
    };
    templateLibrary.templates.push(templateJob);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCustomer.id,
      childTemplateId: templateJob.id
    });

    var templateJobSubtotal = {
      id: Random.id(),
      name: "Job Subtotal",
      description: "Job Subtotal",
      templateType: Constants.templateTypes.function,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.notApplicable
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Job Subtotal"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "jobSubtotal"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.function, value: "SUM"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.applicableTemplateType, value: "Area"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "areaSubtotal"
      }]
    };
    templateLibrary.templates.push(templateJobSubtotal);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateJob.id,
      childTemplateId: templateJobSubtotal.id
    });

    var templateArea = {
      id: Random.id(),
      name: "Area",
      description: "Area",
      templateType: Constants.templateTypes.area,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableCollector, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "area"
      }]
    };
    templateLibrary.templates.push(templateArea);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateJob.id,
      childTemplateId: templateArea.id
    });
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateArea.id,
      childTemplateId: templateArea.id,
      dependency: Constants.dependency.optionalExplicit
    });

    var templateAreaSubtotal = {
      id: Random.id(),
      name: "Area Subtotal",
      description: "Area Subtotal",
      templateType: Constants.templateTypes.function,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.notApplicable
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Area Subtotal"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "areaSubtotal"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.function, value: "SUM"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.applicableTemplateType, value: "ProductSelection"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "priceTotal"
      }]
    };
    templateLibrary.templates.push(templateAreaSubtotal);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateArea.id,
      childTemplateId: templateAreaSubtotal.id
    });

    var templateProductSelection = {
      id: Random.id(),
      name: "Product Selection",
      description: "Product Selection",
      templateType: Constants.templateTypes.productSelection,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableRow"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.isVariableCollector, value: "true"
      }]
    };
    templateLibrary.templates.push(templateProductSelection);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateArea.id,
      childTemplateId: templateProductSelection.id
    });

    var templateProduct = {
      id: Random.id(),
      name: "Product",
      description: "Product",
      templateType: Constants.templateTypes.baseProduct,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isABaseTemplate, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.select
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Primary"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "2"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "product"
      }]
    };
    templateLibrary.templates.push(templateProduct);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templateProduct.id
    });

    var templatePriceEach = {
      id: Random.id(),
      name: "Price Each",
      description: "Price Each",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Each"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "99"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "priceEach"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "111111.11" //Ridiculous value that better be overridden
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.columnWidth, value: "80"
      }]
    };
    templateLibrary.templates.push(templatePriceEach);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templatePriceEach.id
    });

    var templatePriceTotal = {
      id: Random.id(),
      name: "Price Total",
      description: "Price Total",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Total"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "100"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "priceTotal"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "(priceEach * quantity)"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.columnWidth, value: "80"
      }]
    };
    templateLibrary.templates.push(templatePriceTotal);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templatePriceTotal.id
    });

    var templateAreaColumn = {
      id: Random.id(),
      name: "Area Column",
      description: "Area Column",
      templateType: Constants.templateTypes.variableDisplay,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.notApplicable
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Primary"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Area"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToDisplay, value: "area"
      }]
    };
    templateLibrary.templates.push(templateAreaColumn);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templateAreaColumn.id
    });

    var templateQuantity = {
      id: Random.id(),
      name: "Quantity",
      description: "Quantity",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Primary"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Quantity"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "33"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "quantity"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.columnWidth, value: "70"
      }]
    };
    templateLibrary.templates.push(templateQuantity);
    templateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templateQuantity.id
    });

    return TemplateLibraries.insert(templateLibrary);
  };

  let templateLibraryId = TemplateLibraries.findOne({"name": "Bid Model"});

  if (templateLibraryId) {
    return;
  }

  templateLibraryId = initializeBidModelTemplateLibrary();

  _.each(companyInfo.companies, function (company) {
    var companyId = company._id;

    var bidModelTemplateLibrary = TemplateLibraries.findOne({"name": "Bid Model"});
    var companyBidTemplateLibrary = TemplateLibrariesHelper.cloneTemplateLibrary(bidModelTemplateLibrary);

    companyBidTemplateLibrary.name = 'Bid';
    companyBidTemplateLibrary.description = 'Bid';
    companyBidTemplateLibrary.ownerCompanyId = companyId;
    companyBidTemplateLibrary.isPublic = false;
    companyBidTemplateLibrary.isReadOnly = false;
    templateLibraryId = TemplateLibraries.insert(companyBidTemplateLibrary);

    var cabinetryTemplateLibrary = TemplateLibrariesHelper.cloneTemplateLibrary(bidModelTemplateLibrary);
    cabinetryTemplateLibrary._id = Random.id();
    cabinetryTemplateLibrary.name = 'Cabinetry';
    cabinetryTemplateLibrary.description = 'Cabinetry';
    cabinetryTemplateLibrary.ownerCompanyId = companyId;
    cabinetryTemplateLibrary.isPublic = false;
    cabinetryTemplateLibrary.isReadOnly = false;

    // make the cabinetry template library the default
    Companies.update({_id: companyId}, {$set: {defaultTemplateLibraryId: cabinetryTemplateLibrary._id}});

    const templateCompany = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.company
    });
    const templateCustomer = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.customer
    });
    const templateProductSelection = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.productSelection
    });
    const templateProduct = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.baseProduct
    });
    const templateJob = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.job
    });
    const templateArea = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.area
    });

    var templateLookupData = {
      id: Random.id(),
      name: "Lookup Data",
      description: "Standard lookup data for quick access",
      templateType: Constants.templateTypes.lookupData,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "standardLookupData"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.lookupKey, value: "standard"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLookupData);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateLookupData.id
    });

    var templateSheetMaterialData = {
      id: Random.id(),
      name: "Sheet Material Data",
      description: "Sheet material lookup data for quick access",
      templateType: Constants.templateTypes.lookupData,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "sheetMaterialData"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.lookupKey, value: "sheetMaterialData"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateSheetMaterialData);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateSheetMaterialData.id
    });
    //
    //var templateMaterial = {
    //  id: Random.id(),
    //  name: "Material",
    //  description: "Some physical thing",
    //  templateType: Constants.templateTypes.material
    //};
    //cabinetryTemplateLibrary.templates.push(templateMaterial);
    //cabinetryTemplateLibrary.templateRelationships.push({
    //  parentTemplateId: templateProduct.id,
    //  childTemplateId: templateMaterial.id
    //});
    //
    //var templateLabor = {
    //  id: Random.id(),
    //  name: "Labor",
    //  description: "General labor",
    //  templateType: Constants.templateTypes.labor
    //};
    //cabinetryTemplateLibrary.templates.push(templateLabor);
    //cabinetryTemplateLibrary.templateRelationships.push({
    //  parentTemplateId: templateProduct.id,
    //  childTemplateId: templateLabor.id
    //});

    // const priceEachMappings = [{
    //   header: { templateSettingKey: Constants.templateSettingKeys.isVariableOverride, },
    //   value: 'true',
    // }, {
    //   header: { templateSettingKey: Constants.templateSettingKeys.variableToOverride, },
    //   value: 'priceEach',
    // }, {
    //   header: { templateSettingKey: Constants.templateSettingKeys.propertyToOverride, },
    //   value: Constants.templateSettingKeys.valueFormula,
    // }];
    const workbookMetadata = {
      specificationOptions: [
        {
          // Each column represents a different specification option
          // assumption is that first row represents header (like 'Exterior color') and remaining nonempty rows are the options
          sheet: '1. Job Info.',
          startCell: 'G39',
          rowCount: 25,
          columnCount: 12,
          category: {
            name: 'Options',
          },
        }
      ],
      products: [
        {
          generalProductName: 'Drawer Slides',
          defaultUnits: 'pair',
          sheet: 'Price List',
          startCell: 'C165',
          rowCount: 54,
          columns: [
            // ...priceEachMappings,
            // name is at columnOffset of 0 by default so commented
            // {
            //   header: { templateProperty: 'name', },
            //   columnOffset: 0,
            // },
            {
              header: { customProperty: 'unit', },
              value: 'Pair', // columnOffset: 2, // 'E165'
            }, {
              header: { customProperty: 'price', }, // override priceEach
              columnOffset: 1, // 'D165'
            }
          ],
          category: {
            name: 'Hardware',
          },
        }, {
          generalProductName: 'Hinge',
          defaultUnits: 'each',
          sheet: 'Price List',
          startCell: 'C139',
          rowCount: 3,
          columns: [
            //...priceEachMappings,
            // name is at columnOffset of 0 by default so commented
            // {
            //   header: { templateProperty: 'name', },
            //   columnOffset: 0,
            // },
            {
              header: { customProperty: 'description', },
              columnOffset: 1, // D139 since startCell is C139
            }, {
              header: { customProperty: 'unit', },
              columnOffset: 2, // 'E139'
            }, {
              header: { conditionSwitchVariable: 'hardwareMaterial', },
              absoluteRowOffset: -11, // 'F$128'
              columnOffset: 3, // 'F$128'
              columnCount: 4, // F$128, G$128, H$128, I$128
            }, {
              header: { customProperty: 'price', }, // override priceEach
              columnOffset: 3, // 'F139'
            }
          ],
          category: {
            name: 'Hardware',
            subcategory: {
              name: 'Hinges',
            },
          },
        },
      ],
    };
    let lookups = [];
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupType, Constants.hierarchyRoot, 'Hierarchical', undefined, Constants.lookupTypes.hierarchical, [
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack2xClass, value: 'fa fa-square-o fa-stack-2x'},
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack1xClass, value: 'fa fa-sitemap fa-stack-1x'},
      ], undefined, undefined, userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupType, Constants.hierarchyRoot, 'Label', undefined, Constants.lookupTypes.label, [
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack2xClass, value: 'fa fa-square-o fa-stack-2x'},
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack1xClass, value: 'fa fa-ellipsis-h fa-stack-1x'},
      ], undefined, undefined, userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupType, Constants.hierarchyRoot, 'Price', undefined, Constants.lookupTypes.price, [
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack2xClass, value: 'fa fa-square-o fa-stack-2x'},
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack1xClass, value: 'fa fa-dollar fa-stack-1x'},
      ], undefined, undefined, userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupType, Constants.hierarchyRoot, 'Standard', undefined, Constants.lookupTypes.standard, [
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack2xClass, value: 'fa fa-square-o fa-stack-2x'},
        {id: Random.id(), key: Constants.lookupSettingKeys.iconStack1xClass, value: 'fa fa-arrow-up fa-stack-1x'},
      ], undefined, undefined, userInfo.systemAdminUserId);

    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupSubType, `${Constants.hierarchyRoot}${Constants.lookupTypes.hierarchical}`,
      Constants.lookupSubTypes.lookupType, undefined, Constants.lookupSubTypes.lookupType, undefined, undefined, undefined, userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupSubType, `${Constants.hierarchyRoot}${Constants.lookupTypes.hierarchical}.${Constants.lookupSubTypes.lookupType}`,
      Constants.lookupSubTypes.lookupSubType, undefined, Constants.lookupSubTypes.lookupSubType, undefined, undefined, undefined, userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.hierarchical,
      Constants.lookupSubTypes.lookupSubType, `${Constants.hierarchyRoot}${Constants.lookupTypes.standard}`,
      Constants.lookupSubTypes.option, undefined, Constants.lookupSubTypes.option, undefined, undefined, undefined, userInfo.systemAdminUserId);

    // Create lookup records with varying effectiveDate and expirationDate values
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.price,
      'Tea', `InChina`, `Earl Grey`, 'Price of earl grey tea in china', 3.12, undefined,
      moment().startOf('day').add(-10, 'days').toDate(), moment().startOf('day').add(-1, 'days').toDate(), userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.price,
      'Tea', `InChina`, `Earl Grey`, 'Price of earl grey tea in china', 3.18, undefined,
      moment().startOf('day').add(-1, 'days').toDate(), moment().startOf('day').add(2, 'days').toDate(), userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.price,
      'Tea', `InChina`, `Earl Grey`, 'Price of earl grey tea in china', 3.28, undefined,
      moment().startOf('day').add(2, 'days').toDate(), moment().startOf('day').add(12, 'days').toDate(), userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.price,
      'Tea', `InChina`, `Earl Grey`, 'Price of earl grey tea in china', 3.33, undefined,
      moment().startOf('day').add(12, 'days').toDate(), undefined, userInfo.systemAdminUserId);
    LookupsHelper.addLookup(cabinetryTemplateLibrary, lookups, Constants.lookupTypes.price,
      'Tea', `InChina`, `Earl Purple`, 'Price of tea in china', 3.99, undefined,
      moment().startOf('day').add(-10, 'days').toDate(), undefined, userInfo.systemAdminUserId);

    const bidControllerData = {templateLibraries: [cabinetryTemplateLibrary]};
    const workbook = XLSX.readFile(process.env.PWD + '/server/startup/Spreadsheet Estimator V2.1.xlsx');
    _.each(workbookMetadata.products, (productMappings) => {
      TemplateLibrariesHelper.addProductsFromWorkbook(workbook, bidControllerData, lookups, templateProduct, productMappings);
    });

    var templateCabinet = {
      id: Random.id(),
      name: "Cabinet",
      description: "Cabinet",
      templateType: Constants.templateTypes.product,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.selectOption
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.isASubTemplate, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.imageSource, value: "Cabinet.png"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateCabinet);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProduct.id,
      childTemplateId: templateCabinet.id
    });

    const templateParents = [templateCompany, templateCustomer, templateJob, templateArea, templateCabinet];
    _.each(workbookMetadata.specificationOptions, (specificationOptionsMappings) => {
      TemplateLibrariesHelper.addSpecificationOptionsFromWorkbook(workbook, bidControllerData, lookups, templateParents, specificationOptionsMappings);
    });
    // SpreadsheetUtils.excelToParserFormula
    _.each(lookups, (lookup) => {
      Lookups.insert(lookup);
    });

    var templateDoorStyle = {
      id: Random.id(),
      name: "Door Style",
      description: "Door Style",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Options"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "10"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "doorStyle"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "PLAM - 0.5mm PVC"
      }]
      //, {
        // Can override at customer, job, area but not product (because some products don't have doors).
        // Can also override at cabinet.
        // Seems better to explicitly specify with templateRelationship with optionalOverride
        //id: Random.id(), key: Constants.templateSettingKeys.levelsDeepCanOverride, value: "3"
      // }]
    };
    cabinetryTemplateLibrary.templates.push(templateDoorStyle);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateDoorStyle.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateCustomer.id,
      childTemplateId: templateDoorStyle.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateJob.id,
      childTemplateId: templateDoorStyle.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateArea.id,
      childTemplateId: templateDoorStyle.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateDoorStyle.id
    });

    var templateQualityLevel = {
      id: Random.id(),
      name: "Quality Level",
      description: "Quality Level",
      templateType: Constants.templateTypes.specificationGroup,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.select
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Specifications"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.customOptions, value: "GetSpecificationOptions"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "qualityLevel"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "Economy"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateQualityLevel);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateQualityLevel.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateCustomer.id,
      childTemplateId: templateQualityLevel.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateJob.id,
      childTemplateId: templateQualityLevel.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateArea.id,
      childTemplateId: templateQualityLevel.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateProduct.id,
      childTemplateId: templateQualityLevel.id
    });

    var templateEconomy = {
      id: Random.id(),
      name: "Economy",
      description: "Less expensive options favored",
      templateType: Constants.templateTypes.condition,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.conditionType, value: Constants.conditionTypes.switch
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.switchVariable, value: "qualityLevel"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.switchValue, value: "Economy"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateEconomy);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateQualityLevel.id,
      childTemplateId: templateEconomy.id,
    });

    var templateEconomyDoorStyle = {
      id: Random.id(),
      name: "Economy Door Style",
      description: "Economy Door Style",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "doorStyle"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.defaultValue
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "Wood Veneer"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideType, value: Constants.overrideTypes.fromSpecificationGroup
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateEconomyDoorStyle);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateEconomy.id,
      childTemplateId: templateEconomyDoorStyle.id
    });

    var templateEconomyInteriorMaterial = {
      id: Random.id(),
      name: "Interior Material Override",
      description: "Interior (case) material",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.defaultValue
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "WHTMELAMINE"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideType, value: Constants.overrideTypes.fromSpecificationGroup
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateEconomyInteriorMaterial);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateEconomy.id,
      childTemplateId: templateEconomyInteriorMaterial.id
    });

    var templateImperial = {
      id: Random.id(),
      name: "Imperial",
      description: "Highest quality",
      templateType: Constants.templateTypes.condition,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.conditionType, value: Constants.conditionTypes.switch
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.switchVariable, value: "qualityLevel"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.switchValue, value: "Imperial"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateImperial);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateQualityLevel.id,
      childTemplateId: templateImperial.id,
    });

    var templateImperialDoorStyle = {
      id: Random.id(),
      name: "Imperial Door Style",
      description: "Imperial Door Style",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "doorStyle"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.defaultValue
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "PLAM - 0.5mm PVC"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideType, value: Constants.overrideTypes.fromSpecificationGroup
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateImperialDoorStyle);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateImperial.id,
      childTemplateId: templateImperialDoorStyle.id
    });

    var templateImperialInteriorMaterial = {
      id: Random.id(),
      name: "Interior Material Override",
      description: "Interior (case) material",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.defaultValue
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "CHERRY"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideType, value: Constants.overrideTypes.fromSpecificationGroup
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateImperialInteriorMaterial);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateImperial.id,
      childTemplateId: templateImperialInteriorMaterial.id
    });

    var templateLaborCostMultiplier = {
      id: Random.id(),
      name: "Labor Cost Multiplier",
      description: "Labor cost multiplier",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Labor"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "laborCostMultiplier"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "1"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLaborCostMultiplier);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateLaborCostMultiplier.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateCustomer.id,
      childTemplateId: templateLaborCostMultiplier.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateJob.id,
      childTemplateId: templateLaborCostMultiplier.id
    });

    var templateLaborSawingRate = {
      id: Random.id(),
      name: "Labor Sawing Rate",
      description: "Sawing hourly rate",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.denominatorUnit, value: UnitOfMeasure.units.hours
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Labor"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "laborSawingRate"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "60"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLaborSawingRate);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateLaborSawingRate.id
    });

    var templateLaborSawingCost = {
      id: Random.id(),
      name: "Labor Sawing Cost",
      description: "Sawing cost",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Labor"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "laborSawingCost"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "laborCostMultiplier * laborSawingTime * laborSawingRate"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLaborSawingCost);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateLaborSawingCost.id
    });

    var templateLaborSawingTimePerPart = {
      id: Random.id(),
      name: "LaborSawingTimePerPart",
      description: "Sawing time per part",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.minutes
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.denominatorUnit, value: UnitOfMeasure.units.partCount
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Labor"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "laborSawingTimePerPart"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "0.5"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLaborSawingTimePerPart);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateLaborSawingTimePerPart.id
    });

    var templateLaborSawingTime = {
      id: Random.id(),
      name: "Labor Sawing Time",
      description: "Sawing time",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.hours
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Calculations"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "laborSawingTime"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "numCaseParts * laborSawingTimePerPart / 60"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLaborSawingTime);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateLaborSawingTime.id
    });

    var templateOneDoorBaseCabinet = {
      id: Random.id(),
      name: "One Door Base Cabinet",
      description: "One door base cabinet",
      templateType: Constants.templateTypes.product,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.selectOption
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.isASubTemplate, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Base Cabs"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateOneDoorBaseCabinet);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      relationToItem: Constants.relationToItem.subItem,
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateOneDoorBaseCabinet.id
    });

    var templateOneDoorBaseQuantityOverride = {
      id: Random.id(),
      name: "One Door Base Quantity Override",
      description: "Quantity",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "quantity"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.defaultValue
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "2"//Overrides DefaultValue of Cabinet because templateOneDoorBaseCabinet IsASubTemplate and this DefaultValue gets applied after Cabinet's
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateOneDoorBaseQuantityOverride);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateOneDoorBaseCabinet.id,
      childTemplateId: templateOneDoorBaseQuantityOverride.id
    });

    var templateLazySusanCabinet = {
      id: Random.id(),
      name: "Lazy Susan Cabinet",
      description: "Lazy Susan cabinet",
      templateType: Constants.templateTypes.product,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.selectOption
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.isASubTemplate, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.imageSource, value: "LazySusan.png"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Base Cabs"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLazySusanCabinet);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      relationToItem: Constants.relationToItem.subItem,
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateLazySusanCabinet.id
    });

    var templateLazySusanNumAdjustableShelvesOverride = {
      id: Random.id(),
      name: "LazySusanNumAdjustableShelvesOverride",
      description: "Number of adjustable shelves",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "numAdjustableShelves"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.defaultValue
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "0"//Overrides DefaultValue of Cabinet because templateLazySusanCabinet IsASubTemplate and this DefaultValue gets applied after Cabinet's
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLazySusanNumAdjustableShelvesOverride);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateLazySusanCabinet.id,
      childTemplateId: templateLazySusanNumAdjustableShelvesOverride.id
    });

    var templatePriceEachOverride = {
      id: Random.id(),
      name: "Price Each Override",
      description: "Price each",
      templateType: Constants.templateTypes.override,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.isVariableOverride, value: "true"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableToOverride, value: "priceEach"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.propertyToOverride, value: Constants.templateSettingKeys.valueFormula
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.overrideValue, value: "laborSawingCost + casePartsCost"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templatePriceEachOverride);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templatePriceEachOverride.id
    });

    var templateCabinetWidth = {
      id: Random.id(),
      name: "Cabinet Width",
      description: "Cabinet width",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.inches
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Primary"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Width"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "4"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "width"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "16"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.columnWidth, value: "80"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateCabinetWidth);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateCabinetWidth.id
    });

    var templateCabinetHeight = {
      id: Random.id(),
      name: "Cabinet Height",
      description: "Cabinet height",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.inches
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Primary"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Height"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "5"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "height"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "24"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.columnWidth, value: "80"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateCabinetHeight);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateCabinetHeight.id
    });

    var templateCabinetDepth = {
      id: Random.id(),
      name: "Cabinet Depth",
      description: "Cabinet depth",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.inches
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Primary"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Depth"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "6"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "depth"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "36.5"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.columnWidth, value: "80"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateCabinetDepth);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateCabinetDepth.id
    });

    var templateNumAdjustableShelves = {
      id: Random.id(),
      name: "Num Adjustable Shelves",
      description: "Number of adjustable shelves",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.partCount
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Options"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCaption, value: "Num adjustable shelves"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "numAdjustableShelves"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "2"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateNumAdjustableShelves);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateNumAdjustableShelves.id
    });

    var templateNumCaseParts = {
      id: Random.id(),
      name: "NumCaseParts",
      description: "Number of case parts",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.partCount
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Calculations"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "numCaseParts"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.valueFormula, value: "numAdjustableShelves + 4"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateNumCaseParts);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateNumCaseParts.id
    });

    var templateInteriorMaterial = {
      id: Random.id(),
      name: "Interior Material",
      description: "Interior (case) material",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.selectionType, value: Constants.selectionTypes.select
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.customOptions, value: "GetCoreSheetMaterialOptions"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Options"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "7"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "WHTMELAMINE"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateInteriorMaterial);

    //Still need to implement this
    //context.TemplateLookupTables.Add(new TemplateLookupTable
    //{
    //  Template = templateInteriorMaterial,
    //      LookUpTableName = "SheetMaterial",
    //      LookupTableKeyColumns = new List<string> { "Sku" },
    //      LookUpTableKeyValues = new List<string> { null },
    //      LookupTableDisplayColumns = new List<string> { "Description" },
    //  //LookUpTableFilter = "CanBeInterior = 1",
    //});

    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateInteriorMaterial.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateJob.id,
      childTemplateId: templateInteriorMaterial.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateArea.id,
      childTemplateId: templateInteriorMaterial.id
    });
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      dependency: Constants.dependency.optionalOverride,
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateInteriorMaterial.id
    });

    var templateThreeFourthsSheetMaterialCostPerArea = {
      id: Random.id(),
      name: "ThreeFourthsSheetMaterialCostPerArea",
      description: "3/4 inch sheet material cost per square feet",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.denominatorUnit, value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.denominatorUnit, value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Parts"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "threeFourthsSheetMaterialCostPerArea"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.customLookup, value: "GetSheetMaterialCostPerArea"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.caseMaterialInteriorSku, value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.caseMaterialExposedSku, value: "caseMaterialInteriorSku"//Should use "caseMaterialExposedSku" once defined),
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.nominalThickness, value: "0.75"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.defaultValue, value: "3.32"
        //Could be something like this:
        //new KeyValuePair<string, string>(Constants.templateSettingKeys.defaultValue, "getSheetMaterialCostPerArea(caseMaterialInteriorSku, 0.75)"),
        //new KeyValuePair<string, string>("LookUpTableName", "SheetMaterial"),
        //new KeyValuePair<string, string>("PredicateColumn0", "Sku"),
        //new KeyValuePair<string, string>("PredicateComparisonOperator0", "=="),
        //new KeyValuePair<string, string>("PredicateComparisonValue0", "caseMaterialInteriorSku"),
        //new KeyValuePair<string, string>("PredicateColumn1", "SheetThickness"),
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateThreeFourthsSheetMaterialCostPerArea);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateThreeFourthsSheetMaterialCostPerArea.id
    });

    var templateThreeFourthsSheetMaterialCasePartsArea = {
      id: Random.id(),
      name: "ThreeFourthsSheetMaterialCasePartsArea",
      description: "3/4 inch sheet material case square footage",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Calculations"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "1"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "threeFourthsSheetMaterialCasePartsArea"
      }, {
        id: Random.id(),
        key: Constants.templateSettingKeys.valueFormula,
        value: "(2 * height / 12 * depth / 12) + ((numAdjustableShelves + 1) * width / 12 * depth / 12) + (height / 12 * width / 12)"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateThreeFourthsSheetMaterialCasePartsArea);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateThreeFourthsSheetMaterialCasePartsArea.id
    });

    var templateCasePartsCost = {
      id: Random.id(),
      name: "CasePartsCost",
      description: "Case parts cost",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        id: Random.id(), key: Constants.templateSettingKeys.numeratorUnit, value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayCategory, value: "Calculations"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.displayOrder, value: "10"
      }, {
        id: Random.id(), key: Constants.templateSettingKeys.variableName, value: "casePartsCost"
      }, {
        id: Random.id(),
        key: Constants.templateSettingKeys.valueFormula,
        value: "threeFourthsSheetMaterialCasePartsArea * threeFourthsSheetMaterialCostPerArea"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateCasePartsCost);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCabinet.id,
      childTemplateId: templateCasePartsCost.id
    });

    templateLibraryId = TemplateLibraries.insert(cabinetryTemplateLibrary);
  });
}
