(function () {
  'use strict';
  var controllerId = 'productTypeWizard';
  angular.module('app').controller(controllerId,
      ['$uibModalInstance', '$reactive', '$scope', 'lookupData', 'templateLibraries', 'bid', 'WizardHandler', productTypeWizard]);

  function productTypeWizard($uibModalInstance, $reactive, $scope, lookupData, templateLibraries, bid, WizardHandler) {
    $reactive(this).attach($scope);

    $scope.lookupData = lookupData;
    $scope.templateLibraries = templateLibraries;
    $scope.templateLibrary = templateLibraries[0];

    $scope.bid = bid;
    $scope.vm = this;
    $scope.stepTitle = stepTitle;
    $scope.addExistingDependentTemplate = addExistingDependentTemplate;
    $scope.addNewDependentTemplate = addNewDependentTemplate;
    $scope.cancel = cancel;
    $scope.canExitBasics = canExitBasics;
    $scope.changePricingMethodId = changePricingMethodId;
    $scope.costOrRetailPrice = costOrRetailPrice;
    $scope.existingTemplateToAddDefault = {name: 'Select existing setting to add'};
    $scope.bidControllerData = bid.getPendingChanges();
    $scope.model = {
      basics: {
        pricingMethod: 'Fixed',
        unitOfMeasure: 'Each',
      },
      dependencies: {
        existingTemplateToAdd: $scope.existingTemplateToAddDefault,
        newSettingToAdd: undefined,
        newOptionToAdd: undefined,
      },
      dependentTemplates: [],
      dependentTemplateOptions: [],
      availableTemplates: [
        $scope.existingTemplateToAddDefault,
        ..._.chain(TemplateLibrariesHelper.getOverridableTemplatesBySelectionType(
          $scope.bidControllerData, bid.areaTemplate, Constants.selectionTypes.select))
          .filter((candidateTemplate) => {
            return candidateTemplate.name !== 'Markup Level';
          })
          .sortBy('name')
          .value(),
      ],
      pricingData: [],
      selectedDependentTemplate: undefined,
    };
    $scope.basicsFields = [
      {
        "className": "row",
        "fieldGroup": [
          {
            "className": "col-sm-6",
            key: 'name',
            type: 'input',
            templateOptions: {
              label: 'Name',
              placeholder: 'Widget',
              required: true
            }
          },
          {
            "className": "col-sm-6",
            key: 'category',
            type: 'input',
            templateOptions: {
              label: 'Category',
              description: 'Which Available Products tab this will display in',
              placeholder: 'Widgets',
              required: true
            }
          },
          {
            "className": "col-sm-12",
            key: 'description',
            type: 'input',
            templateOptions: {
              label: 'Description',
              placeholder: 'Description',
            }
          },
          {
            "className": "col-sm-6",
            key: 'pricingMethod',
            type: 'select',
            templateOptions: {
              label: 'Pricing Method',
              placeholder: 'Pricing Method',
              required: true,
              "valueProp": "name",
              "options": [
                {
                  "name": "Fixed"
                },
                {
                  "name": "Cost +"
                },
              ],
            }
          },
          {
            "className": "col-sm-6",
            key: 'unitOfMeasure',
            type: 'select',
            templateOptions: {
              label: 'Unit of Measure',
              description: 'What price is in relation to, goes with Quantity input',
              placeholder: 'Unit of Measure',
              required: true,
              "valueProp": "name",
              "options": [
                {
                  "name": "Each"
                },
                {
                  "name": "LF (linear feet)"
                },
                {
                  "name": "SF (square feet)"
                },
                {
                  "name": "Pair"
                },
              ],
            }
          }
        ]
      },
    ];
    // $scope.dependenciesFields = [
    //   {
    //     "className": "row",
    //     "fieldGroup": [
    //       {
    //         "className": "col-sm-6",
    //         key: 'existingTemplateToAdd',
    //         type: 'select',
    //         templateOptions: {
    //           label: `Existing Option to Add`,
    //           description: `An existing option that affects the ${costOrRetailPrice().toLowerCase()}`,
    //           required: false,
    //           "valueProp": "value",
    //           onChange: addExistingDependentTemplate,
    //           "options": _.map($scope.model.availableTemplates, (availableTemplate) => {
    //             return {
    //               "name": availableTemplate.name,
    //               "value": availableTemplate,
    //             }
    //           })
    //         }
    //       },
    //       {
    //         "className": "col-sm-6",
    //         key: 'newTemplateToAdd',
    //         type: 'input',
    //         templateOptions: {
    //           label: `New Option to Add`,
    //           description: `A new option that affects the ${costOrRetailPrice().toLowerCase()}`,
    //           required: false,
    //         }
    //       },
    //     ],
    //   }
    // ];
    $scope.addNewOption = addNewOption;
    $scope.removeOption = removeOption;
    $scope.isDependentTemplateSelected = isDependentTemplateSelected;
    $scope.removeDependentTemplate = removeDependentTemplate;
    $scope.selectDependentTemplate = selectDependentTemplate;
    $scope.enterPricing = enterPricing;
    $scope.minusName = minusName;

    this.lookupData = lookupData;
    this.templateLibraries = templateLibraries;
    this.templateLibrary = $scope.templateLibrary;
    this.bid = bid;
    this.stepTitle = stepTitle;
    this.addExistingDependentTemplate = addExistingDependentTemplate;
    this.addNewDependentTemplate = addNewDependentTemplate;
    this.addNewOption = addNewOption;
    this.removeOption = removeOption;
    this.canExitBasics = canExitBasics;
    this.cancel = cancel;
    this.changePricingMethodId = changePricingMethodId;
    this.costOrRetailPrice = costOrRetailPrice;
    this.model = $scope.model;
    this.isDependentTemplateSelected = isDependentTemplateSelected;
    this.removeDependentTemplate = removeDependentTemplate;
    this.selectDependentTemplate = selectDependentTemplate;
    this.enterPricing = enterPricing;
    this.minusName = minusName;

    // settingOptions is an array of the setting options set so far
    // remainingOptionArrays is an array of arrays of remaining options that have not been added to pricingData
    const addPricingData = (settingOptions, remainingOptionArrays) => {
      if (remainingOptionArrays.length === 0) {
        $scope.model.pricingData.push({
          settingOptions,
          price: undefined
        });
      } else {
        _.each(remainingOptionArrays[0], (remainingOption) => {
          addPricingData([...settingOptions, remainingOption], _.rest(remainingOptionArrays));
        });
      }
    }

    function enterPricing() {
      $scope.model.pricingData = [];
      let remainingOptionArrays = [];
      for (var i = 0; i < $scope.model.dependentTemplates.length; i++) {
        remainingOptionArrays.push([
          '[Default]',
          ...$scope.model.dependentTemplateOptions[i]
        ]);
      }
      addPricingData([], remainingOptionArrays);
      return true;
    }

    function getExistingOptions(dependentTemplate) {
      const options = [];
      TemplateLibrariesHelper.populateLookupOptions($scope.bidControllerData, dependentTemplate, options);
      return options.map((option) => option.name);
    }

    function updateDependentTemplateOptions() {
      selectDependentTemplate($scope.model.selectedDependentTemplate);
    }

    function removeDependentTemplate(dependentTemplate) {
      const indexOfTemplateToRemove = _.indexOf($scope.model.dependentTemplates, dependentTemplate);
      if (indexOfTemplateToRemove != -1) {
        $scope.model.dependentTemplates.splice(indexOfTemplateToRemove, 1);
        $scope.model.dependentTemplateOptions.splice(indexOfTemplateToRemove, 1);
        const newSelectedDependentTemplateIndex = indexOfTemplateToRemove >= $scope.model.dependentTemplates.length
          ? indexOfTemplateToRemove - 1
          : indexOfTemplateToRemove;
        $scope.model.selectedDependentTemplate = $scope.model.dependentTemplates[newSelectedDependentTemplateIndex];
        updateDependentTemplateOptions();
      }
    }

    function isDependentTemplateSelected(dependentTemplate) {
      return $scope.model.selectedDependentTemplate === dependentTemplate;
    }

    function selectDependentTemplate(dependentTemplate) {
      const indexOfDependentTemplate = _.indexOf($scope.model.dependentTemplates, dependentTemplate);
      $scope.model.selectedDependentTemplate = dependentTemplate;
      $scope.model.selectedDependentTemplateOptions = $scope.model.dependentTemplateOptions[indexOfDependentTemplate];
    }

    function addExistingDependentTemplate() {
      console.log($scope.model.dependencies.existingTemplateToAdd);
      $scope.model.selectedDependentTemplate = $scope.model.dependencies.existingTemplateToAdd;
      $scope.model.dependentTemplates.push($scope.model.dependencies.existingTemplateToAdd);
      $scope.model.dependentTemplateOptions.push(getExistingOptions($scope.model.dependencies.existingTemplateToAdd));
      $scope.model.dependencies.existingTemplateToAdd = $scope.existingTemplateToAddDefault;
      updateDependentTemplateOptions();
    }

    function addNewDependentTemplate() {
      console.log($scope.model.dependencies.newSettingToAdd);
      const newDependentTemplate = {
        name: $scope.model.dependencies.newSettingToAdd,
      };
      $scope.model.dependentTemplates.push(newDependentTemplate);
      $scope.model.dependentTemplateOptions.push([]);
      $scope.model.dependencies.newSettingToAdd = undefined;
      $scope.model.selectedDependentTemplate = newDependentTemplate;
      updateDependentTemplateOptions();
    }

    function addNewOption() {
      console.log($scope.model.dependencies.newOptionToAdd);
      const indexOfSelectedDependentTemplate = _.indexOf($scope.model.dependentTemplates, $scope.model.selectedDependentTemplate);
      $scope.model.dependentTemplateOptions[indexOfSelectedDependentTemplate].push($scope.model.dependencies.newOptionToAdd);
      $scope.model.dependencies.newOptionToAdd = undefined;
    }

    function removeOption(option) {
      const indexOfSelectedDependentTemplate = _.indexOf($scope.model.dependentTemplates, $scope.model.selectedDependentTemplate);
      const indexOfOptionToRemove = _.indexOf($scope.model.dependentTemplateOptions[indexOfSelectedDependentTemplate], option);
      if (indexOfOptionToRemove != -1) {
        $scope.model.dependentTemplateOptions[indexOfSelectedDependentTemplate].splice(indexOfOptionToRemove, 1);
      }
    }

    function canExitBasics() {
      return !!$scope.model.basics.name && !!$scope.model.basics.category;
    }

    function cancel() {
      $uibModalInstance.dismiss();
    }

    function changePricingMethodId() {

    }

    function costOrRetailPrice() {
      return $scope.model.basics.pricingMethod === 'Fixed' ? 'Retail Price' : 'Cost';
    }

    function minusName(){
      return $scope.model.basics.name ? '- ' + $scope.model.basics.name + ' ' : '';
    }

    function stepTitle() {
      return WizardHandler.wizard() && WizardHandler.wizard().currentStep() && WizardHandler.wizard().currentStepTitle();
    }
  }
})();
