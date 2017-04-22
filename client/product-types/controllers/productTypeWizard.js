(function () {
  'use strict';
  var controllerId = 'productTypeWizard';
  angular.module('app').controller(controllerId,
      ['$uibModalInstance', '$reactive', '$scope', 'lookupData', 'templateLibraries', 'vm', 'WizardHandler', productTypeWizard]);

  function productTypeWizard($uibModalInstance, $reactive, $scope, lookupData, templateLibraries, vm, WizardHandler) {
    $reactive(this).attach($scope);

    $scope.lookupData = lookupData;
    $scope.templateLibraries = templateLibraries;
    $scope.templateLibrary = templateLibraries[0];
    $scope.vm = vm;
    $scope.stepTitle = stepTitle;
    $scope.cancel = cancel;
    $scope.canExitBasics = canExitBasics;
    $scope.changePricingMethodId = changePricingMethodId;
    $scope.costOrRetailPrice = costOrRetailPrice;
    $scope.model = {
      basics: {
        pricingMethod: 'Fixed',
        unitOfMeasure: 'Each',
      },
      dependencies: {
        dependentTemplateToAdd: undefined,
      },
      dependentTemplates: [],
      availableTemplates: _.chain(TemplateLibrariesHelper.getOverridableTemplatesBySelectionType(
        vm.getPendingChanges(), vm.areaTemplate, Constants.selectionTypes.select))
        .filter((candidateTemplate) => {
          return candidateTemplate.name !== 'Markup Level';
        })
        .sortBy('name')
        .value(),
    };

    $scope.basicsFields = [
      {
        "className": "row",
        "fieldGroup": [
          {
            "className": "col-sm-12",
            key: 'name',
            type: 'input',
            templateOptions: {
              label: 'Name',
              placeholder: 'Widget',
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
    $scope.dependenciesFields = [
      {
        "className": "row",
        "fieldGroup": [
          {
            "className": "col-sm-12",
            key: 'dependentTemplateToAdd',
            type: 'select',
            templateOptions: {
              label: `${costOrRetailPrice()} Dependency To Add`,
              placeholder: 'Select dependency to add',
              required: false,
              "valueProp": "name",
              "options": [
                {
                  "name": "Create New Option",
                  "value": "new_option",
                },
                ..._.map($scope.model.availableTemplates, (availableTemplate) => {
                  return {
                    "name": availableTemplate.name,
                    "value": availableTemplate,
                    "group": "Existing Option"
                  }
                })
              ]
            }
          },
        ],
      }
    ];

    this.lookupData = lookupData;
    this.templateLibraries = templateLibraries;
    this.templateLibrary = $scope.templateLibrary;
    this.vm = vm;
    this.stepTitle = stepTitle;
    this.canExitBasics = canExitBasics;
    this.cancel = cancel;
    this.changePricingMethodId = changePricingMethodId;
    this.costOrRetailPrice = costOrRetailPrice;
    this.model = $scope.model;

    function canExitBasics() {
      return !!$scope.model.basics.name;
    }

    function cancel() {
      $uibModalInstance.dismiss();
    }

    function changePricingMethodId() {

    }

    function costOrRetailPrice() {
      return $scope.model.basics.pricingMethod === 'Fixed' ? 'Retail Price' : 'Cost';
    }

    function stepTitle() {
      return WizardHandler.wizard() && WizardHandler.wizard().currentStep() && WizardHandler.wizard().currentStepTitle();
    }
  }
})();
