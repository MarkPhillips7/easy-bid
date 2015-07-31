/*
 * Generate Test Companies, Users, roles
 */
//Confidential information stored in settings.*.json
Meteor.startup(function () {
  var systemAdminUserId;

  // Create a starting list of groups/companies (the name of these record will be used to identify the group with roles)
  var weMakeCabinets = {
    name: "We Make Cabinets",
    websiteUrl: "http://WeMakeCabinets.com",
    logoUrl: "http://we-make-cabinets.png"
  };
  var sheetMaterialRUs = {
    name: "Sheet Material R Us",
    websiteUrl: "http://sheetMaterialRUs.com",
    logoUrl: "http://sheet-material-r-us.png"
  };
  var companies = [weMakeCabinets, sheetMaterialRUs];

  //Confidential information stored in settings.*.json
  var markPhillips = {
    firstName: "Mark",
    lastName: "Phillips",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.systemAdmin]
    }],
    subscription: {
      plan: {
        name: "free"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  var gregPhillips =
  {
    firstName: "Greg",
    lastName: "Phillips",
    email: "Greg@EasyBid.com",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.systemAdmin]
    }],
    subscription: {
      plan: {
        name: "free"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  var johnCabinetmaker =
  {
    firstName: "John",
    lastName: "Cabinetmaker",
    email: "john@WeMakeCabinets.com",
    "password": "testTest",
    "phoneNumber": "4345551212",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.user]
    }, {
      group: "We Make Cabinets",
      roles: [Config.roles.user, Config.roles.manageTemplates, Config.roles.manageUsers]
    }],
    customerId: "cus_6J0QZsY1LoekyP",
    subscription: {
      plan: {
        name: "proMonthly"//Eventually would be nice to have something like "proMonthly2User" to also pay for Henry
      },
      payment: {
        card: {
          type: "Visa",
          lastFour: "1234"
        },
        nextPaymentDue: ( new Date() ).getTime()
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  var henryCabinetmaker =
  {
    firstName: "Henry",
    lastName: "Cabinetmaker",
    email: "henry@WeMakeCabinets.com",
    "password": "testTest",
    "phoneNumber": "4345551212",
    rolesByGroups: [{
      group: Roles.GLOBAL_GROUP,
      roles: [Config.roles.user]
    }, {
      group: "We Make Cabinets",
      roles: [Config.roles.user]
    }],
    customerId: "cus_6J0QZsY1LoekyP",
    subscription: {
      plan: {
        name: "proMonthly"//Eventually would be nice to have something like "proMonthlyCompanyPaid", And John cabinetmaker would be "proMonthly2User"
      },
      status: "active",
      ends: ( new Date() ).getTime()
    }
  };
  ''
  var bobCustomer =
  {
    firstName: "Bob",
    lastName: "Customer",
    email: "bob@anywhere.com",
    phoneNumber: "4345551212",
    notes: "Can also be reached at 123-456-7890",
    rolesByGroups: [{
      group: "We Make Cabinets",
      roles: [Config.roles.customer]
    }]
  };
//var guest =
//{
//  firstName: "Guest",
//  lastName: "",
//  roles: {role: "guest", Roles.GLOBAL_GROUP}
//};

  var users = [markPhillips, gregPhillips, johnCabinetmaker, henryCabinetmaker, bobCustomer];

  _.each(users, function (user) {
    var confidentialUserInfo = _.find(Meteor.settings.private.users, function (u) {
          return u.firstName === user.firstName && u.lastName === user.lastName;
        }) || {};
    var userEmail = user.email || confidentialUserInfo.email,
        userPassword = user.password || confidentialUserInfo.password || new Meteor.Collection.ObjectID().toString(),
        userPhoneNumber = user.phoneNumber || confidentialUserInfo.phoneNumber,
        userStripeCustomerId = user.customerId || confidentialUserInfo.customerId;

    var theUser = Meteor.users.findOne({"emails.address": userEmail});
    var userId = theUser && theUser._id;

    // If an existing user is not found, create the account.
    if (!userId) {

      userId = Accounts.createUser({
        email: userEmail,
        password: userPassword,
        profile: {
          name: user.firstName + " " + user.lastName
        }
      });

      if (userId) {

        if (user.rolesByGroups.length > 0) {
          // Need _id of existing user record so this call must come
          // after `Accounts.createUser` or `Accounts.onCreate`
          _.each(user.rolesByGroups, function (roleInfo) {
            Roles.setUserRoles(userId, roleInfo.roles, roleInfo.group);
          });
        }

        Meteor.users.update(userId, {
          $set: {
            'profile.subscription': user.subscription,
            'profile.customerId': userStripeCustomerId,
            'profile.phoneNumber': userPhoneNumber,
            'profile.notes': user.notes
          }
        }, function (error, response) {
          if (error) {
            console.log(error);
          } else {
            console.log(user.firstName + " " + user.lastName + " was added as a user");
          }
        });
      }

    }

    if (user == markPhillips) {
      systemAdminUserId = userId;
    }
  });

  var templateLibraryId = TemplateLibraries.findOne({"name": "Bid Model"});

  // If an existing templateLibrary is not found, create it.
  if (!templateLibraryId) {

    var templateLibrary = {
      name: "Bid Model",
      description: "Bid Model",
      isReadOnly: true,
      isPublic: true,
      //imageUrl: templateLibrary.websiteUrl,
      //ownerCompanyId:
      createdBy: systemAdminUserId,
      templates: [],
      templateRelationships: []
    };

    var templateCompany = {
      id: Random.id(),
      name: "Company",
      description: "Company that provides service",
      templateType: Constants.templateTypes.company,
      templateSettings: [{
        key: "IsVariableCollector", value: "True"
      }]
    };
    templateLibrary.templates.push(templateCompany);

    var templateCustomer = {
      id: Random.id(),
      name: "Customer",
      description: "Customer requesting a bid",
      templateType: Constants.templateTypes.customer,
      templateSettings: [{
        key: "IsVariableCollector", value: "True"
      }]
    };
    templateLibrary.templates.push(templateCustomer);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateCompany.id,
      childTemplateId: templateCustomer.id
    });

    var templateJob = {
      id: Random.id(),
      name: "Job",
      description: "The job or project being bid",
      templateType: Constants.templateTypes.job,
      templateSettings: [{
        key: "IsVariableCollector", value: "True"
      }]
    };
    templateLibrary.templates.push(templateJob);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateCustomer.id,
      childTemplateId: templateJob.id
    });

    var templateJobSubtotal = {
      id: Random.id(),
      name: "JobSubtotal",
      description: "Job Subtotal",
      templateType: Constants.templateTypes.function,
      templateSettings: [{
        key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        key: "SelectionType", value: Constants.selectionTypes.notApplicable
      }, {
        key: "DisplayCaption", value: "Job Subtotal"
      }, {
        key: "VariableName", value: "jobSubtotal"
      }, {
        key: "Function", value: "SUM"
      }, {
        key: "ApplicableTemplateType", value: "Area"
      }, {
        key: "ParameterVariable", value: "areaSubtotal"
      }]
    };
    templateLibrary.templates.push(templateJobSubtotal);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateJob.id,
      childTemplateId: templateJobSubtotal.id
    });

    var templateArea = {
      id: Random.id(),
      name: "Area",
      description: "Area",
      templateType: Constants.templateTypes.area,
      templateSettings: [{
        key: "IsVariableCollector", value: "True"
      }, {
        key: "VariableName", value: "area"
      }]
    };
    templateLibrary.templates.push(templateArea);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateJob.id,
      childTemplateId: templateArea.id
    });
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateArea.id,
      childTemplateId: templateArea.id,
      dependency: Constants.dependency.optionalExplicit
    });

    var templateAreaSubtotal = {
      id: Random.id(),
      name: "AreaSubtotal",
      description: "Area Subtotal",
      templateType: Constants.templateTypes.function,
      templateSettings: [{
        key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        key: "SelectionType", value: Constants.selectionTypes.notApplicable
      }, {
        key: "DisplayCaption", value: "Area Subtotal"
      }, {
        key: "VariableName", value: "areaSubtotal"
      }, {
        key: "Function", value: "SUM"
      }, {
        key: "ApplicableTemplateType", value: "productSelection"
      }, {
        key: "ParameterVariable", value: "priceSubtotal"
      }]
    };
    templateLibrary.templates.push(templateAreaSubtotal);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateArea.id,
      childTemplateId: templateAreaSubtotal.id
    });

    var templateProductSelection = {
      id: Random.id(),
      name: "ProductSelection",
      description: "Product Selection",
      templateType: Constants.templateTypes.productSelection,
      templateSettings: [{
        key: "DisplayCategory", value: "PrimaryTableRow"
      }, {
        key: "IsVariableCollector", value: "True"
      }]
    };
    templateLibrary.templates.push(templateProductSelection);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateArea.id,
      childTemplateId: templateProductSelection.id
    });

    var templateProduct = {
      id: Random.id(),
      name: "Product",
      description: "Product",
      templateType: Constants.templateTypes.baseProduct,
      templateSettings: [{
        key: "IsABaseTemplate", value: "True"
      }, {
        key: "SelectionType", value: Constants.selectionTypes.select
      }, {
        key: "DisplayCategory", value: "Primary"
      }, {
        key: "DisplayCategory", value: "PrimaryPrimaryTableColumn"
      }, {
        key: "DisplayOrder", value: "2"
      }, {
        key: "VariableName", value: "product"
      }]
    };
    templateLibrary.templates.push(templateProduct);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templateProduct.id
    });

    var templatePriceEach = {
      id: Random.id(),
      name: "PriceEach",
      description: "Price Each",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        key: "DisplayCaption", value: "Each"
      }, {
        key: "DisplayOrder", value: "99"
      }, {
        key: "VariableName", value: "priceEach"
      }, {
        key: "ValueFormula", value: "111111.11" //Ridiculous value that better be overridden
      }, {
        key: "ColumnWidth", value: "80"
      }]
    };
    templateLibrary.templates.push(templatePriceEach);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templatePriceEach.id
    });

    var templatePriceTotal = {
      id: Random.id(),
      name: "PriceTotal",
      description: "Price Total",
      templateType: Constants.templateTypes.calculation,
      templateSettings: [{
        key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
      }, {
        key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        key: "DisplayCaption", value: "Total"
      }, {
        key: "DisplayOrder", value: "100"
      }, {
        key: "VariableName", value: "priceTotal"
      }, {
        key: "ValueFormula", value: "(priceEach * quantity)"
      }, {
        key: "ColumnWidth", value: "80"
      }]
    };
    templateLibrary.templates.push(templatePriceTotal);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templatePriceTotal.id
    });

    var templateAreaColumn = {
      id: Random.id(),
      name: "AreaColumn",
      description: "AreaColumn",
      templateType: Constants.templateTypes.variableDisplay,
      templateSettings: [{
        key: "SelectionType", value: Constants.selectionTypes.notApplicable
      }, {
        key: "DisplayCategory", value: "Primary"
      }, {
        key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        key: "DisplayCaption", value: "Area"
      }, {
        key: "DisplayOrder", value: "1"
      }, {
        key: "VariableToDisplay", value: "area"
      }]
    };
    templateLibrary.templates.push(templateAreaColumn);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templateAreaColumn.id
    });

    var templateQuantity = {
      id: Random.id(),
      name: "Quantity",
      description: "Quantity",
      templateType: Constants.templateTypes.input,
      templateSettings: [{
        key: "SelectionType", value: Constants.selectionTypes.entry
      }, {
        key: "DisplayCategory", value: "Primary"
      }, {
        key: "DisplayCategory", value: "PrimaryTableColumn"
      }, {
        key: "DisplayCaption", value: "Quantity"
      }, {
        key: "DisplayOrder", value: "33"
      }, {
        key: "VariableName", value: "quantity"
      }, {
        key: "DefaultValue", value: "1"
      }, {
        key: "ColumnWidth", value: "70"
      }]
    };
    templateLibrary.templates.push(templateQuantity);
    templateLibrary.templateRelationships.push({
      parentTemplateId: templateProductSelection.id,
      childTemplateId: templateQuantity.id
    });

    templateLibraryId = TemplateLibraries.insert(templateLibrary);
  }

  _.each(companies, function (company) {
    var companyId;

    companyId = Companies.findOne({"name": company.name});

    // If an existing company is not found, create it.
    if (!companyId) {

      companyId = Companies.insert({
        name: company.name,
        websiteUrl: company.websiteUrl,
        logoUrl: company.logoUrl,
        createdBy: systemAdminUserId
      });

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

      templateCompany = _.find(cabinetryTemplateLibrary.templates, function(template) {return template.templateType === Constants.templateTypes.company});
      templateCustomer = _.find(cabinetryTemplateLibrary.templates, function(template) {return template.templateType === Constants.templateTypes.customer});
      templateProduct = _.find(cabinetryTemplateLibrary.templates, function(template) {return template.templateType === Constants.templateTypes.baseProduct});
      templateJob = _.find(cabinetryTemplateLibrary.templates, function(template) {return template.templateType === Constants.templateTypes.job});
      templateArea = _.find(cabinetryTemplateLibrary.templates, function(template) {return template.templateType === Constants.templateTypes.area});

      var templateSheetMaterialData = {
        id: Random.id(),
        name: "SheetMaterialData",
        description: "Sheet material lookup data for quick access",
        templateType: Constants.templateTypes.lookupData,
        templateSettings: [{
          key: "VariableName", value: "sheetMaterialData"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateSheetMaterialData);
      cabinetryTemplateLibrary.templateRelationships.push({
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
          key: "SelectionType", value: Constants.selectionTypes.selectOption
        }, {
          key: "IsASubTemplate", value: "True"
        }, {
          key: "ImageSource", value: "cabinet.png"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateCabinet);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateProduct.id,
        childTemplateId: templateCabinet.id
      });

      var templateLaborCostMultiplier = {
        id: Random.id(),
        name: "LaborCostMultiplier",
        description: "Labor cost multiplier",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "SelectionType", value: Constants.selectionTypes.entry
        }, {
          key: "DisplayCategory", value: "Labor"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "laborCostMultiplier"
        }, {
          key: "DefaultValue", value: "1"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLaborCostMultiplier);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCompany.id,
        childTemplateId: templateLaborCostMultiplier.id
      });

      var templateLaborSawingRate = {
        id: Random.id(),
        name: "LaborSawingRate",
        description: "Sawing hourly rate",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
        }, {
          key: "DenominatorUnit", value: UnitOfMeasure.units.hours
        }, {
          key: "SelectionType", value: Constants.selectionTypes.entry
        }, {
          key: "DisplayCategory", value: "Labor"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "laborSawingRate"
        }, {
          key: "DefaultValue", value: "60"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLaborSawingRate);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCompany.id,
        childTemplateId: templateLaborSawingRate.id
      });

      var templateLaborSawingCost = {
        id: Random.id(),
        name: "LaborSawingCost",
        description: "Sawing cost",
        templateType: Constants.templateTypes.calculation,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
        }, {
          key: "DisplayCategory", value: "Labor"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "laborSawingCost"
        }, {
          key: "ValueFormula", value: "laborCostMultiplier * laborSawingTime * laborSawingRate"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLaborSawingCost);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateLaborSawingCost.id
      });

      var templateLaborSawingTimePerPart = {
        id: Random.id(),
        name: "LaborSawingTimePerPart",
        description: "Sawing time per part",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.minutes
        }, {
          key: "DenominatorUnit", value: UnitOfMeasure.units.partCount
        }, {
          key: "DisplayCategory", value: "Labor"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "laborSawingTimePerPart"
        }, {
          key: "DefaultValue", value: "0.5"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLaborSawingTimePerPart);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCompany.id,
        childTemplateId: templateLaborSawingTimePerPart.id
      });

      var templateLaborSawingTime = {
        id: Random.id(),
        name: "LaborSawingTime",
        description: "Sawing time",
        templateType: Constants.templateTypes.calculation,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.hours
        }, {
          key: "DisplayCategory", value: "Calculations"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "laborSawingTime"
        }, {
          key: "ValueFormula", value: "numCaseParts * laborSawingTimePerPart / 60"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLaborSawingTime);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateLaborSawingTime.id
      });

      var templateOneDoorBaseCabinet = {
        id: Random.id(),
        name: "OneDoorBaseCabinet",
        description: "One door base cabinet",
        templateType: Constants.templateTypes.product,
        templateSettings: [{
          key: "SelectionType", value: Constants.selectionTypes.selectOption
        }, {
          key: "IsASubTemplate", value: "True"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateOneDoorBaseCabinet);
      cabinetryTemplateLibrary.templateRelationships.push({
        relationToItem: Constants.relationToItem.subItem,
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateOneDoorBaseCabinet.id
      });

      var templateOneDoorBaseQuantityOverride = {
        id: Random.id(),
        name: "OneDoorBaseQuantityOverride",
        description: "Quantity",
        templateType: Constants.templateTypes.override,
        templateSettings: [{
          key: "IsVariableOverride", value: "True"
        }, {
          key: "VariableToOverride", value: "quantity"
        }, {
          key: "PropertyToOverride", value: "DefaultValue"
        }, {
          key: "OverrideValue", value: "2"//Overrides DefaultValue of Cabinet because templateOneDoorBaseCabinet IsASubTemplate and this DefaultValue gets applied after Cabinet's
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateOneDoorBaseQuantityOverride);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateOneDoorBaseCabinet.id,
        childTemplateId: templateOneDoorBaseQuantityOverride.id
      });

      var templateLazySusanCabinet = {
        id: Random.id(),
        name: "LazySusanCabinet",
        description: "Lazy Susan cabinet",
        templateType: Constants.templateTypes.product,
        templateSettings: [{
          key: "SelectionType", value: Constants.selectionTypes.selectOption
        }, {
          key: "IsASubTemplate", value: "True"
        }, {
          key: "ImageSource", value: "LazySusan.png"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLazySusanCabinet);
      cabinetryTemplateLibrary.templateRelationships.push({
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
          key: "IsVariableOverride", value: "True"
        }, {
          key: "VariableToOverride", value: "numAdjustableShelves"
        }, {
          key: "PropertyToOverride", value: "DefaultValue"
        }, {
          key: "OverrideValue", value: "0"//Overrides DefaultValue of Cabinet because templateLazySusanCabinet IsASubTemplate and this DefaultValue gets applied after Cabinet's
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateLazySusanNumAdjustableShelvesOverride);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateLazySusanCabinet.id,
        childTemplateId: templateLazySusanNumAdjustableShelvesOverride.id
      });

      var templatePriceEachOverride = {
        id: Random.id(),
        name: "PriceEachOverride",
        description: "Price each",
        templateType: Constants.templateTypes.override,
        templateSettings: [{
          key: "IsVariableOverride", value: "True"
        }, {
          key: "VariableToOverride", value: "priceEach"
        }, {
          key: "PropertyToOverride", value: "ValueFormula"
        }, {
          key: "OverrideValue", value: "laborSawingCost + casePartsCost"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templatePriceEachOverride);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templatePriceEachOverride.id
      });

      var templateCabinetWidth = {
        id: Random.id(),
        name: "CabinetWidth",
        description: "Cabinet width",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.inches
        }, {
          key: "SelectionType", value: Constants.selectionTypes.entry
        }, {
          key: "DisplayCategory", value: "Primary"
        }, {
          key: "DisplayCategory", value: "PrimaryTableColumn"
        }, {
          key: "DisplayCaption", value: "Width"
        }, {
          key: "DisplayOrder", value: "4"
        }, {
          key: "VariableName", value: "width"
        }, {
          key: "DefaultValue", value: "16"
        }, {
          key: "ColumnWidth", value: "80"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateCabinetWidth);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateCabinetWidth.id
      });

      var templateCabinetHeight = {
        id: Random.id(),
        name: "CabinetHeight",
        description: "Cabinet height",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.inches
        }, {
          key: "SelectionType", value: Constants.selectionTypes.entry
        }, {
          key: "DisplayCategory", value: "Primary"
        }, {
          key: "DisplayCategory", value: "PrimaryTableColumn"
        }, {
          key: "DisplayCaption", value: "Height"
        }, {
          key: "DisplayOrder", value: "5"
        }, {
          key: "VariableName", value: "height"
        }, {
          key: "DefaultValue", value: "24"
        }, {
          key: "ColumnHeight", value: "80"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateCabinetHeight);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateCabinetHeight.id
      });

      var templateCabinetDepth = {
        id: Random.id(),
        name: "CabinetDepth",
        description: "Cabinet depth",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.inches
        }, {
          key: "SelectionType", value: Constants.selectionTypes.entry
        }, {
          key: "DisplayCategory", value: "Primary"
        }, {
          key: "DisplayCategory", value: "PrimaryTableColumn"
        }, {
          key: "DisplayCaption", value: "Depth"
        }, {
          key: "DisplayOrder", value: "6"
        }, {
          key: "VariableName", value: "depth"
        }, {
          key: "DefaultValue", value: "36.5"
        }, {
          key: "ColumnDepth", value: "80"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateCabinetDepth);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateCabinetDepth.id
      });

      var templateNumAdjustableShelves = {
        id: Random.id(),
        name: "NumAdjustableShelves",
        description: "Number of adjustable shelves",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.partCount
        }, {
          key: "SelectionType", value: Constants.selectionTypes.entry
        }, {
          key: "DisplayCategory", value: "Options"
        }, {
          key: "DisplayCaption", value: "Num adjustable shelves"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "numAdjustableShelves"
        }, {
          key: "DefaultValue", value: "2"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateNumAdjustableShelves);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateNumAdjustableShelves.id
      });

      var templateNumCaseParts = {
        id: Random.id(),
        name: "NumCaseParts",
        description: "Number of case parts",
        templateType: Constants.templateTypes.calculation,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.partCount
        }, {
          key: "DisplayCategory", value: "Calculations"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "numCaseParts"
        }, {
          key: "ValueFormula", value: "numAdjustableShelves + 4"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateNumCaseParts);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateNumCaseParts.id
      });

      var templateInteriorMaterial = {
        id: Random.id(),
        name: "InteriorMaterial",
        description: "Interior (case) material",
        templateType: Constants.templateTypes.input,
        templateSettings: [{
          key: "SelectionType", value: Constants.selectionTypes.select
        }, {
          key: "CustomOptions", value: "GetCoreSheetMaterialOptions"
        }, {
          key: "DisplayCategory", value: "Options"
        }, {
          key: "DisplayOrder", value: "7"
        }, {
          key: "VariableName", value: "caseMaterialInteriorSku"
        }, {
          key: "DefaultValue", value: "CHERRY"
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
        parentTemplateId: templateJob.id,
        childTemplateId: templateInteriorMaterial.id
      });
      cabinetryTemplateLibrary.templateRelationships.push({
        dependency: Constants.dependency.optionalOverride,
        parentTemplateId: templateArea.id,
        childTemplateId: templateInteriorMaterial.id
      });
      cabinetryTemplateLibrary.templateRelationships.push({
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
          key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
        }, {
          key: "DenominatorUnit", value: UnitOfMeasure.units.feet
        }, {
          key: "DenominatorUnit", value: UnitOfMeasure.units.feet
        }, {
          key: "DisplayCategory", value: "Parts"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "threeFourthsSheetMaterialCostPerArea"
        }, {
          key: "CustomLookup", value: "GetSheetMaterialCostPerArea"
        }, {
          key: "CaseMaterialInteriorSku", value: "caseMaterialInteriorSku"
        }, {
          key: "CaseMaterialExposedSku", value: "caseMaterialInteriorSku"//Should use "caseMaterialExposedSku" once defined),
        }, {
          key: "CaseMaterialInteriorSku", value: "caseMaterialInteriorSku"
        }, {
          key: "NominalThickness", value: "0.75"
        }, {
          key: "DefaultValue", value: "3.32"
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
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateThreeFourthsSheetMaterialCostPerArea.id
      });
      
      var templateThreeFourthsSheetMaterialCasePartsArea = {
        id: Random.id(),
        name: "ThreeFourthsSheetMaterialCasePartsArea",
        description: "3/4 inch sheet material case square footage",
        templateType: Constants.templateTypes.calculation,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.feet
        }, {
          key: "NumeratorUnit", value: UnitOfMeasure.units.feet
        }, {
          key: "DisplayCategory", value: "Calculations"
        }, {
          key: "DisplayOrder", value: "1"
        }, {
          key: "VariableName", value: "threeFourthsSheetMaterialCasePartsArea"
        }, {
          key: "ValueFormula", value: "(2 * height / 12 * depth / 12) + ((numAdjustableShelves + 1) * width / 12 * depth / 12) + (height / 12 * width / 12)"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateThreeFourthsSheetMaterialCasePartsArea);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateThreeFourthsSheetMaterialCasePartsArea.id
      });

      var templateCasePartsCost = {
        id: Random.id(),
        name: "CasePartsCost",
        description: "Case parts cost",
        templateType: Constants.templateTypes.calculation,
        templateSettings: [{
          key: "NumeratorUnit", value: UnitOfMeasure.units.dollars
        }, {
          key: "DisplayCategory", value: "Calculations"
        }, {
          key: "DisplayOrder", value: "10"
        }, {
          key: "VariableName", value: "casePartsCost"
        }, {
          key: "ValueFormula", value: "threeFourthsSheetMaterialCasePartsArea * threeFourthsSheetMaterialCostPerArea"
        }]
      };
      cabinetryTemplateLibrary.templates.push(templateCasePartsCost);
      cabinetryTemplateLibrary.templateRelationships.push({
        parentTemplateId: templateCabinet.id,
        childTemplateId: templateCasePartsCost.id
      });

      templateLibraryId = TemplateLibraries.insert(cabinetryTemplateLibrary);
    }
  });

});