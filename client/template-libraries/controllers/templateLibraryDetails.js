angular.module("app").controller("templateLibraryDetails", ['$scope', '$meteor', '$q', '$rootScope', '$stateParams', '$timeout',
  function ($scope, $meteor, $q, $rootScope, $stateParams, $timeout) {
    var vm = this;
    vm.isTemplateSelected = isTemplateSelected;
    vm.onItemSelected = onItemSelected;
    vm.productHierarchy = {};
    vm.productHierarchyData = [];
    vm.relevantTemplateTypesWithTemplates = [];
    vm.selectedTemplate;
    vm.selectTemplateId = selectTemplateId;
    vm.templateHasFocus = templateHasFocus;
    vm.templateLibrary = {};

    activate();

    function activate() {
      var subscriptionHandle;
      $meteor.subscribe('templateLibraries')
          .then(setSubscriptionHandle)
          .then(setTemplateLibrary)
          .then(setFullProductHierarchy)
          .then(setInitialTemplate, failure);

      $scope.$on('$destroy', function () {
        subscriptionHandle.stop();
      });

      function setSubscriptionHandle(handle) {
        subscriptionHandle = handle;
        return $q.when(null);
      }

    function setTemplateLibrary() {
      //vm.templateLibraries = $meteor.collection(TemplateLibraries);
      vm.templateLibrary = TemplateLibraries.findOne($stateParams.templateLibraryId);
      return $q.when(null);
    }
  }

    function setInitialTemplate() {
      var initialTemplate;

      if (vm.templateLibrary) {
        if ($stateParams.templateItemId) {
          initialTemplate = _.find(vm.templateLibrary.templates, function(template){ return template.id === $stateParams.templateItemId});
        }
        else {
          initialTemplate = TemplateLibrariesHelper.getRootTemplate(vm.templateLibrary);
        }

        selectTemplate(initialTemplate);
      }

      return $q.when(null);
    }

    function failure(error) {
      var message = 'Unexpected error.' + error.message;
      console.log(message);
      //logError(message, error);
      throw error;
    }

    function onItemSelected(branch) {
      selectTemplate(getTemplateById(branch ? branch.data.templateId : 0));
    }

    function selectTemplateId(templateId){
      selectTemplate(getTemplateById(templateId));
    }

    function selectTemplate(template) {
      if (!template) {
        return;
      }

      vm.selectedTemplate = template;
      var branchToSelect = findBranchInHierarchyList(vm.productHierarchyData, template.id);
      if (branchToSelect && vm.productHierarchy.get_selected_branch && branchToSelect !== vm.productHierarchy.get_selected_branch()) {
        vm.productHierarchy.select_branch(branchToSelect);
      }
      vm.breadcrumbItems = [];
      populateBreadcrumbItems(vm.breadcrumbItems, vm.selectedTemplate, true);

      setTemplateTypeInfo(template);

      var relevantTemplateTypeWithTemplates = _.find(vm.relevantTemplateTypesWithTemplates, function (templateTypeWithTemplates) {
        return templateTypeWithTemplates.templateType === template.templateType;
      });

      if (relevantTemplateTypeWithTemplates) {
        relevantTemplateTypeWithTemplates.selectedTemplate = template;
      }
    }

    function findBranchInHierarchyList(hierarchyList, templateId) {
      var branchToSelect;

      for (var i = 0; i < hierarchyList.length; i++) {
        var hierarchyItem = hierarchyList[i];
        if (hierarchyItem.data.templateId === templateId) {
          branchToSelect = hierarchyItem;
        }
        else {
          branchToSelect = findBranchInHierarchyList(hierarchyItem.children, templateId);
        }

        if (branchToSelect) {
          return branchToSelect;
        }
      }

      return null;
    }

    function populateBreadcrumbItems(breadcrumbItems, template, isActive) {
      breadcrumbItems.unshift({
        name: template.name,
        templateId: template.id,
        class: isActive ? 'active' : ''
      });

      var parentTemplate = TemplateLibrariesHelper.parentTemplate(vm.templateLibrary, template, [Constants.dependency.optionalOverride]);
      if (parentTemplate) {
        populateBreadcrumbItems(breadcrumbItems, parentTemplate, false);
      }
    }

    function setTemplateTypeInfo(template) {
      vm.relevantTemplateTypesWithTemplates = [];

      if (!template) {
        return;
      }

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
        var visitedTemplates = [];

        populateTypicalRelevantTemplates(template, visitedTemplates, false, true, true, 0);

        visitedTemplates = [];
        populateRelevantSubProductTemplates(template, visitedTemplates, true);

        vm.variablesSorted = _.sortBy(vm.variables, 'variableName');

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

    function populateRelevantSubProductTemplates(template, visitedTemplates, isPrimary) {
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
        populateRelevantSubProductTemplates(templateChildren[i], visitedTemplates, false);
      }
    }

    function populateTypicalRelevantTemplates(template, visitedTemplates, ignoreSubTemplates, isPrimary, isSelectedTemplateType, levelsFromSelected) {
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

      var isVariableCollector = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.isVariableCollector);
      var isThisTemplateTypePrimary = isPrimary && (isSelectedTemplateType || !isVariableCollector);
      var variableName = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.variableName);
      if (variableName) {
        //Don't include variables that are hierarchically below selected template type when isVariableCollector is true
        if (!isVariableCollector || levelsFromSelected >= 0) {
          setVariableInfo(variableName, true, isThisTemplateTypePrimary, false, false);
        }
      }

      relevantTemplateInfo = _.find(vm.relevantTemplateTypesWithTemplates, function (templateInfo) {
        return templateInfo.templateType === template.templateType;
      });

      if (relevantTemplateInfo) {
        //Products added by populateRelevantSubProductTemplates
        if (template.templateType !== Constants.templateTypes.product) {
          relevantTemplateInfo.relevantTemplates.push(template);
        }
      }

      if (template.templateType === Constants.templateTypes.override) {
        var variableToOverride = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.variableToOverride);
        if (variableToOverride) {
          setVariableInfo(variableToOverride, false, isThisTemplateTypePrimary, true, false);
        }
      }
      else if (template.templateType === Constants.templateTypes.calculation) {
        var valueFormula = ItemTemplatesHelper.getTemplateSettingValueForTemplate(template, Constants.templateSettingKeys.valueFormula);
        if (valueFormula) {
          //Now indicate that all of the variables in the formula are being used
          expr = Parser.parse(valueFormula);
          expr.variables().forEach(
              function (templateVariableName) {
                setVariableInfo(templateVariableName, false, false, false, true);
              });
        }
      }

      //Now populate children (but ignore sub templates)
      var templateChildren = TemplateLibrariesHelper.templateChildren(vm.templateLibrary, template, [Constants.dependency.optionalOverride]);
      for (var i = 0; i < templateChildren.length; i++) {
        //Decided to only populate children if this template type is primary
        if (!ignoreSubTemplates || isThisTemplateTypePrimary) {
          populateTypicalRelevantTemplates(templateChildren[i], visitedTemplates, true, isThisTemplateTypePrimary, false, levelsFromSelected - 1);
        }
      }

      //Now populate helper templates for parent(s)
      var parentTemplates = TemplateLibrariesHelper.parentTemplates(vm.templateLibrary, template, [Constants.dependency.optionalOverride]);
      for (var i = 0; i < parentTemplates.length; i++) {
        populateTypicalRelevantTemplates(parentTemplates[i], visitedTemplates, false, false, false, levelsFromSelected + 1);
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

          var templateChildTypeInfo = _.find(TemplateTypeInfoList, function (templateTypeInfo) {
            return templateTypeInfo.templateType === templateChild.templateType;
          });
          if (templateChildTypeInfo && templateChildTypeInfo.displayInHierarchy) {
            treeDataChildren.push(addItemToTreeData(getTreeDataChildren(templateChild, visitedTemplates), templateChild));
          }
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