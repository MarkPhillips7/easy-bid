angular.module("app").controller("templateLibraryDetails", ['$scope', '$meteor', '$q', '$rootScope', '$stateParams', '$timeout',
  function ($scope, $meteor, $q, $rootScope, $stateParams, $timeout) {
    var vm = this;
    vm.isTemplateSelected = isTemplateSelected;
    vm.onItemSelected = onItemSelected;
    vm.productHierarchy = {};
    vm.productHierarchyData = [];
    vm.relevantTemplateTypesWithTemplates = [];
    vm.selectedTemplate;
    vm.templateHasFocus = templateHasFocus;
    vm.templateLibrary = {};

    activate();

    function activate() {
      var subscriptionHandle;
      $meteor.subscribe('templateLibraries')
          .then(setSubscriptionHandle)
          .then(setTemplateLibrary)
          .then(setFullProductHierarchy, failure);

      $scope.$on('$destroy', function () {
        subscriptionHandle.stop();
      });

      function setSubscriptionHandle(handle) {
        subscriptionHandle = handle;
        return $q.when(null);
      }

      function setTemplateLibrary() {
        //vm.templateLibraries = $meteor.collection(TemplateLibraries);
        vm.templateLibrary = TemplateLibraries.findOne($stateParams.templateLibraryId);//vm.templateLibraries[0];//$scope.$meteorObject(TemplateLibraries, $stateParams.templateLibraryId);
        return $q.when(null);
      }
    }

    function failure(error) {
      var message = 'Unexpected error.' + error.message;
      console.log(message);
      //logError(message, error);
      throw error;
    }

    function onItemSelected(branch) {
      var breadcrumbText = '';
      selectTemplate(getTemplateById(branch ? branch.data.templateId : 0));
    }

    function selectTemplate(template){
      vm.selectedTemplate = template;

      setTemplateTypeInfo(template);

      var relevantTemplateTypeWithTemplates = _.find(vm.relevantTemplateTypesWithTemplates, function (templateTypeWithTemplates) {
        return templateTypeWithTemplates.templateType === template.templateType;
      });

      if (relevantTemplateTypeWithTemplates) {
        relevantTemplateTypeWithTemplates.selectedTemplate = template;
      }
    }

    function setTemplateTypeInfo(template){
      vm.relevantTemplateTypesWithTemplates = [];

      if (!template) {
        return;
      }

      var visitedTemplates = [];
      var templateTypeInfo = _.find(TemplateTypeInfoList, function (templateTypeInfo) {
        return templateTypeInfo.templateType === template.templateType;
      });

      if (templateTypeInfo) {
        templateTypeInfo.relevantTemplateTypes.forEach(function (relevantTemplateType) {
          vm.relevantTemplateTypesWithTemplates.push({
            name: relevantTemplateType.name,
            templateType: relevantTemplateType.templateType,
            selectedTemplate: {},
            relevantTemplates: []
          });
        });
        vm.variables = [];

        populateTypicalRelevantTemplates(template, visitedTemplates, false, true);
        populateRelevantSubProductTemplates(template, true);

        //Initialize first template as selected
        vm.relevantTemplateTypesWithTemplates.forEach(function (relevantTemplateTypeWithTemplates) {
          if (relevantTemplateTypeWithTemplates.relevantTemplates.length > 0) {
            relevantTemplateTypeWithTemplates.selectedTemplate = relevantTemplateTypeWithTemplates.relevantTemplates[0];
          }
        });
      }
    }

    function setVariableInfo(variableName, isSet, isPrimary, isOverride, isUsed) {
      var variable;

      if (!variableName) {
        return;
      }

      variable = _.find(vm.variables, function (v) {
        return v.variableName.toLowerCase() === variableName.toLowerCase();
      });

      if (!variable) {
        variable = {
          variableName: variableName,
          isSet: isSet,
          isPrimary: isPrimary,
          isOverride: isOverride,
          isUsed: isUsed
        };
        vm.variables.push(variable);
      }
      else {
        if (isSet) {
          variable.isSet = isSet;
        }
        if (isPrimary) {
          variable.isPrimary = isPrimary;
        }
        if (isOverride) {
          variable.isOverride = isOverride;
        }
        if (isUsed) {
          variable.isUsed = isUsed;
        }
      }

      if (variable.isUsed && !variable.isSet) {
        variable.labelClass = 'label label-danger';
      }
      else if (variable.isPrimary && variable.isOverride) {
        variable.labelClass = 'label label-primary';
      }
      else if (variable.isPrimary) {
        variable.labelClass = 'label label-success';
      }
      else {
        variable.labelClass = 'label label-default';
      }
    }

    function isTemplateSelected(template) {
      var relevantTemplateInfo = _.find(vm.relevantTemplateTypesWithTemplates, function (templateInfo) {
        return templateInfo.templateType === template.templateType;
      });

      return relevantTemplateInfo && template === relevantTemplateInfo.selectedTemplate;
    }

    function populateRelevantSubProductTemplates(template, isPrimary) {
      var relevantTemplateInfo;

      if (!template) {
        return;
      }

      if (!isPrimary && template.templateType === Constants.templateTypes.product) {
        relevantTemplateInfo = _.find(vm.relevantTemplateTypesWithTemplates, function (templateInfo) {
          return templateInfo.templateType === template.templateType;
        });

        if (relevantTemplateInfo) {
          relevantTemplateInfo.relevantTemplates.push(template);

          //template.isTemplateSelected = function () {
          //  return template === relevantTemplateInfo.selectedTemplate;
          //};
        }
      }

      var templateChildren = TemplateLibrariesHelper.templateChildren(vm.templateLibrary, template);
      for (var i = 0; i < templateChildren.length; i++) {
        populateRelevantSubProductTemplates(templateChildren[i], false);
      }
    }

    function populateTypicalRelevantTemplates(template, visitedTemplates, ignoreSubTemplates, isPrimary) {
      var templateRelationship;
      var expr;
      var relevantTemplateInfo;

      if (!template) {
        return;
      }

      //Don't do anything if template has already been visited
      if (_.contains(visitedTemplates, template)) {
        return;
      }

      //Necessary to avoid infinite recursive loop
      visitedTemplates.push(template);

      if (ignoreSubTemplates && ItemTemplatesHelper.isASubTemplate(template)) {
        return;
      }

      var variableName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template,Constants.templateSettingKeys.variableName);
      if (variableName) {
        setVariableInfo(variableName, true, isPrimary, false, false);
      }

      relevantTemplateInfo = _.find(vm.relevantTemplateTypesWithTemplates, function (templateInfo) {
        return templateInfo.templateType === template.templateType;
      });

      if (relevantTemplateInfo) {
        //Products added by populateRelevantSubProductTemplates
        if (template.templateType !== Constants.templateTypes.product) {
          relevantTemplateInfo.relevantTemplates.push(template);

          //template.isTemplateSelected = function () {
          //  return template === relevantTemplateInfo.selectedTemplate;
          //};
        }

        if (template.templateType === Constants.templateTypes.override) {
          var variableToOverride = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template,Constants.templateSettingKeys.variableToOverride);
          if (variableToOverride) {
            setVariableInfo(variableToOverride, false, isPrimary, true, false);
          }
        }
        else if (template.templateType === Constants.templateTypes.calculation) {
          var valueFormula = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template,Constants.templateSettingKeys.valueFormula);
          if (valueFormula) {
            //Now indicate that all of the variables in the formula are being used
            //expr = Parser.parse(valueFormula);
            //expr.variables().forEach(
            //    function (templateVariableName) {
            //      setVariableInfo(templateVariableName, false, false, false, true);
            //    });
          }
        }

        //Now populate children (but ignore sub templates)
        var templateChildren = TemplateLibrariesHelper.templateChildren(vm.templateLibrary, template);
        for (var i = 0; i < templateChildren.length; i++) {
          populateTypicalRelevantTemplates(templateChildren[i], visitedTemplates, true, isPrimary);
        }

        //Now populate helper templates for parent(s)
        var parentTemplate = TemplateLibrariesHelper.parentTemplate(vm.templateLibrary, template);
        populateTypicalRelevantTemplates(parentTemplate, visitedTemplates, false, false);
      }
    }

    function getTemplateById(templateId) {
      return _.find(vm.templateLibrary.templates, function (template) {
        return template.id === templateId;
      });
    }

    function setFullProductHierarchy() {
      vm.productHierarchyData = [];

      if (vm.templateLibrary) {
        var rootTemplate = TemplateLibrariesHelper.getRootTemplate(vm.templateLibrary);
        var visitedTemplates = [];
        vm.productHierarchyData.push(addItemToTreeData(getTreeDataChildren(rootTemplate, visitedTemplates), rootTemplate));
      }

      $timeout(function () {
        if (vm.productHierarchy.expand_all) {
          vm.productHierarchy.expand_all();
        }
      }, 50);

      return $q.when(null);
    }

    function getTreeDataChildren(template, visitedTemplates) {
      var templateChildren = TemplateLibrariesHelper.templateChildren(vm.templateLibrary, template);
      var treeDataChildren = [];

      _.each(templateChildren, function (templateChild) {
        if (!_.find(visitedTemplates, function (visitedTemplate) {
              return visitedTemplate === templateChild;
            })) {
          visitedTemplates.push(templateChild);
          treeDataChildren.push(addItemToTreeData(getTreeDataChildren(templateChild, visitedTemplates), templateChild));
        }
      });

      return treeDataChildren;
    }

    function templateHasFocus(template) {
      var relevantTemplateTypeWithTemplates = null;

      if (template) {
        relevantTemplateTypeWithTemplates = _.find(vm.relevantTemplateTypesWithTemplates, function (templateTypeWithTemplates) {
          return templateTypeWithTemplates.templateType === template.templateType;
        });

        if (relevantTemplateTypeWithTemplates) {
          relevantTemplateTypeWithTemplates.selectedTemplate = template;
        }
      }
    }


    //
    //function setProductHierarchy(template) {
    //  vm.productHierarchyData = [];
    //  addProductToHierarchyAndReturnChildrenArray(null, template);
    //
    //  $timeout(function () {
    //    if (vm.productHierarchy.expand_all) {
    //      vm.productHierarchy.expand_all();
    //    }
    //  }, 50);
    //
    //  return $q.when(null);
    //}
    //
    //function addProductToHierarchyAndReturnChildrenArray(childrenArrayToAddThisTo, productTemplate) {
    //  var childrenArrayToReturn = [];
    //  var treeItem;
    //
    //  if (productTemplate) {
    //    if (ItemTemplatesHelper.isABaseTemplate(productTemplate)) {
    //      childrenArrayToAddThisTo = vm.productHierarchyData;
    //    } else {
    //      childrenArrayToAddThisTo = addProductToHierarchyAndReturnChildrenArray(null, TemplateLibrariesHelper.parentTemplate(vm.templatelibrary, productTemplate));
    //    }
    //
    //    treeItem = addItemToTreeData(childrenArrayToReturn, productTemplate);
    //
    //    if (childrenArrayToAddThisTo) {
    //      childrenArrayToAddThisTo.push(treeItem);
    //    }
    //  }
    //
    //  return childrenArrayToReturn;
    //}

    function addItemToTreeData(childrenArray, productTemplate) {
      var treeItem = {
        data: {templateId: productTemplate.id},
        label: productTemplate.name,
        children: childrenArray
      }

      return treeItem;
    }

  }]);
