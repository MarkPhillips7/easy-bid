// Should be called by initializeEverything.js
Initialization.initializeTemplates = function(companyInfo, userInfo) {
  var templateLibraryId = TemplateLibraries.findOne({"name": "Bid Model"});

  if (templateLibraryId) {
    return;
  }

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
      id: Random.id(), key: "IsVariableCollector", value: "true"
    }]
  };
  templateLibrary.templates.push(templateCompany);

  var templateCustomer = {
    id: Random.id(),
    name: "Customer",
    description: "Customer requesting a bid",
    templateType: Constants.templateTypes.customer,
    templateSettings: [{
      id: Random.id(), key: "IsVariableCollector", value: "true"
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
      id: Random.id(), key: "IsVariableCollector", value: "true"
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
      id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
    }, {
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.notApplicable
    }, {
      id: Random.id(), key: "DisplayCaption", value: "Job Subtotal"
    }, {
      id: Random.id(), key: "VariableName", value: "jobSubtotal"
    }, {
      id: Random.id(), key: "Function", value: "SUM"
    }, {
      id: Random.id(), key: "ApplicableTemplateType", value: "Area"
    }, {
      id: Random.id(), key: "ParameterVariable", value: "areaSubtotal"
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
      id: Random.id(), key: "IsVariableCollector", value: "true"
    }, {
      id: Random.id(), key: "VariableName", value: "area"
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
      id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
    }, {
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.notApplicable
    }, {
      id: Random.id(), key: "DisplayCaption", value: "Area Subtotal"
    }, {
      id: Random.id(), key: "VariableName", value: "areaSubtotal"
    }, {
      id: Random.id(), key: "Function", value: "SUM"
    }, {
      id: Random.id(), key: "ApplicableTemplateType", value: "productSelection"
    }, {
      id: Random.id(), key: "ParameterVariable", value: "priceSubtotal"
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
      id: Random.id(), key: "DisplayCategory", value: "PrimaryTableRow"
    }, {
      id: Random.id(), key: "IsVariableCollector", value: "true"
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
      id: Random.id(), key: "IsABaseTemplate", value: "true"
    }, {
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.select
    }, {
      id: Random.id(), key: "DisplayCategory", value: "Primary"
    }, {
      id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
    }, {
      id: Random.id(), key: "DisplayOrder", value: "2"
    }, {
      id: Random.id(), key: "VariableName", value: "product"
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
      id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
    }, {
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
    }, {
      id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
    }, {
      id: Random.id(), key: "DisplayCaption", value: "Each"
    }, {
      id: Random.id(), key: "DisplayOrder", value: "99"
    }, {
      id: Random.id(), key: "VariableName", value: "priceEach"
    }, {
      id: Random.id(), key: "ValueFormula", value: "111111.11" //Ridiculous value that better be overridden
    }, {
      id: Random.id(), key: "ColumnWidth", value: "80"
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
      id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
    }, {
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
    }, {
      id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
    }, {
      id: Random.id(), key: "DisplayCaption", value: "Total"
    }, {
      id: Random.id(), key: "DisplayOrder", value: "100"
    }, {
      id: Random.id(), key: "VariableName", value: "priceTotal"
    }, {
      id: Random.id(), key: "ValueFormula", value: "(priceEach * quantity)"
    }, {
      id: Random.id(), key: "ColumnWidth", value: "80"
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
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.notApplicable
    }, {
      id: Random.id(), key: "DisplayCategory", value: "Primary"
    }, {
      id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
    }, {
      id: Random.id(), key: "DisplayCaption", value: "Area"
    }, {
      id: Random.id(), key: "DisplayOrder", value: "1"
    }, {
      id: Random.id(), key: "VariableToDisplay", value: "area"
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
      id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
    }, {
      id: Random.id(), key: "DisplayCategory", value: "Primary"
    }, {
      id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
    }, {
      id: Random.id(), key: "DisplayCaption", value: "Quantity"
    }, {
      id: Random.id(), key: "DisplayOrder", value: "33"
    }, {
      id: Random.id(), key: "VariableName", value: "quantity"
    }, {
      id: Random.id(), key: "DefaultValue", value: "1"
    }, {
      id: Random.id(), key: "ColumnWidth", value: "70"
    }]
  };
  templateLibrary.templates.push(templateQuantity);
  templateLibrary.templateRelationships.push({
    id: Random.id(),
    parentTemplateId: templateProductSelection.id,
    childTemplateId: templateQuantity.id
  });

  templateLibraryId = TemplateLibraries.insert(templateLibrary);

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

    cabinetryTemplateLibrary.name = 'Cabinetry';
    cabinetryTemplateLibrary.description = 'Cabinetry';
    cabinetryTemplateLibrary.ownerCompanyId = companyId;
    cabinetryTemplateLibrary.isPublic = false;
    cabinetryTemplateLibrary.isReadOnly = false;

    templateCompany = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.company
    });
    templateCustomer = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.customer
    });
    templateProduct = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.baseProduct
    });
    templateJob = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.job
    });
    templateArea = _.find(cabinetryTemplateLibrary.templates, function (template) {
      return template.templateType === Constants.templateTypes.area
    });

    var templateSheetMaterialData = {
      id: Random.id(),
      name: "Sheet Material Data",
      description: "Sheet material lookup data for quick access",
      templateType: Constants.templateTypes.lookupData,
      templateSettings: [{
        id: Random.id(), key: "VariableName", value: "sheetMaterialData"
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

    var templateCabinet = {
      id: Random.id(),
      name: "Cabinet",
      description: "Cabinet",
      templateType: Constants.templateTypes.product,
      templateSettings: [{
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.selectOption
      }, {
        id: Random.id(), key: "IsASubTemplate", value: "true"
      }, {
        id: Random.id(), key: "ImageSource", value: "Cabinet.png"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateCabinet);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateProduct.id,
      childTemplateId: templateCabinet.id
    });

    var templateLaborCostMultiplier = {
      id: Random.id(),
      name: "Labor Cost Multiplier",
      description: "Labor cost multiplier",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Labor"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "laborCostMultiplier"
      }, {
        id: Random.id(), key: "DefaultValue", value: "1"
      }]
    };
    cabinetryTemplateLibrary.templates.push(templateLaborCostMultiplier);
    cabinetryTemplateLibrary.templateRelationships.push({
      id: Random.id(),
      parentTemplateId: templateCompany.id,
      childTemplateId: templateLaborCostMultiplier.id
    });

    var templateLaborSawingRate = {
      id: Random.id(),
      name: "Labor Sawing Rate",
      description: "Sawing hourly rate",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: "DenominatorUnit", value: UnitOfMeasure.units.hours
      }, {
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Labor"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "laborSawingRate"
      }, {
        id: Random.id(), key: "DefaultValue", value: "60"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Labor"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "laborSawingCost"
      }, {
        id: Random.id(), key: "ValueFormula", value: "laborCostMultiplier * laborSawingTime * laborSawingRate"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.minutes
      }, {
        id: Random.id(), key: "DenominatorUnit", value: UnitOfMeasure.units.partCount
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Labor"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "laborSawingTimePerPart"
      }, {
        id: Random.id(), key: "DefaultValue", value: "0.5"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.hours
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Calculations"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "laborSawingTime"
      }, {
        id: Random.id(), key: "ValueFormula", value: "numCaseParts * laborSawingTimePerPart / 60"
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
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.selectOption
      }, {
        id: Random.id(), key: "IsASubTemplate", value: "true"
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
        id: Random.id(), key: "IsVariableOverride", value: "true"
      }, {
        id: Random.id(), key: "VariableToOverride", value: "quantity"
      }, {
        id: Random.id(), key: "PropertyToOverride", value: "DefaultValue"
      }, {
        id: Random.id(), key: "OverrideValue", value: "2"//Overrides DefaultValue of Cabinet because templateOneDoorBaseCabinet IsASubTemplate and this DefaultValue gets applied after Cabinet's
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
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.selectOption
      }, {
        id: Random.id(), key: "IsASubTemplate", value: "true"
      }, {
        id: Random.id(), key: "ImageSource", value: "LazySusan.png"
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
        id: Random.id(), key: "IsVariableOverride", value: "true"
      }, {
        id: Random.id(), key: "VariableToOverride", value: "numAdjustableShelves"
      }, {
        id: Random.id(), key: "PropertyToOverride", value: "DefaultValue"
      }, {
        id: Random.id(), key: "OverrideValue", value: "0"//Overrides DefaultValue of Cabinet because templateLazySusanCabinet IsASubTemplate and this DefaultValue gets applied after Cabinet's
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
        id: Random.id(), key: "IsVariableOverride", value: "true"
      }, {
        id: Random.id(), key: "VariableToOverride", value: "priceEach"
      }, {
        id: Random.id(), key: "PropertyToOverride", value: "ValueFormula"
      }, {
        id: Random.id(), key: "OverrideValue", value: "laborSawingCost + casePartsCost"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.inches
      }, {
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Primary"
      }, {
        id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: "DisplayCaption", value: "Width"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "4"
      }, {
        id: Random.id(), key: "VariableName", value: "width"
      }, {
        id: Random.id(), key: "DefaultValue", value: "16"
      }, {
        id: Random.id(), key: "ColumnWidth", value: "80"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.inches
      }, {
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Primary"
      }, {
        id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: "DisplayCaption", value: "Height"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "5"
      }, {
        id: Random.id(), key: "VariableName", value: "height"
      }, {
        id: Random.id(), key: "DefaultValue", value: "24"
      }, {
        id: Random.id(), key: "ColumnHeight", value: "80"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.inches
      }, {
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Primary"
      }, {
        id: Random.id(), key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        id: Random.id(), key: "DisplayCaption", value: "Depth"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "6"
      }, {
        id: Random.id(), key: "VariableName", value: "depth"
      }, {
        id: Random.id(), key: "DefaultValue", value: "36.5"
      }, {
        id: Random.id(), key: "ColumnDepth", value: "80"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.partCount
      }, {
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Options"
      }, {
        id: Random.id(), key: "DisplayCaption", value: "Num adjustable shelves"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "numAdjustableShelves"
      }, {
        id: Random.id(), key: "DefaultValue", value: "2"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.partCount
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Calculations"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "numCaseParts"
      }, {
        id: Random.id(), key: "ValueFormula", value: "numAdjustableShelves + 4"
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
        id: Random.id(), key: "SelectionType", value: Constants.selectionTypes.select
      }, {
        id: Random.id(), key: "CustomOptions", value: "GetCoreSheetMaterialOptions"
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Options"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "7"
      }, {
        id: Random.id(), key: "VariableName", value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: "DefaultValue", value: "CHERRY"
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: "DenominatorUnit", value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: "DenominatorUnit", value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Parts"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "threeFourthsSheetMaterialCostPerArea"
      }, {
        id: Random.id(), key: "CustomLookup", value: "GetSheetMaterialCostPerArea"
      }, {
        id: Random.id(), key: "CaseMaterialInteriorSku", value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: "CaseMaterialExposedSku", value: "caseMaterialInteriorSku"//Should use "caseMaterialExposedSku" once defined),
      }, {
        id: Random.id(), key: "CaseMaterialInteriorSku", value: "caseMaterialInteriorSku"
      }, {
        id: Random.id(), key: "NominalThickness", value: "0.75"
      }, {
        id: Random.id(), key: "DefaultValue", value: "3.32"
        //Could be something like this:
        //new KeyValuePair<string, string>("DefaultValue", "getSheetMaterialCostPerArea(caseMaterialInteriorSku, 0.75)"),
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.feet
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Calculations"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "1"
      }, {
        id: Random.id(), key: "VariableName", value: "threeFourthsSheetMaterialCasePartsArea"
      }, {
        id: Random.id(),
        key: "ValueFormula",
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
        id: Random.id(), key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        id: Random.id(), key: "DisplayCategory", value: "Calculations"
      }, {
        id: Random.id(), key: "DisplayOrder", value: "10"
      }, {
        id: Random.id(), key: "VariableName", value: "casePartsCost"
      }, {
        id: Random.id(),
        key: "ValueFormula",
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
