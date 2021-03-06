import {Parser} from 'expr-eval';

angular.module("app").controller("templateLibraryDetails",
  ['$scope', '$meteor', '$q', '$rootScope', '$stateParams', '$timeout', '$uibModal', 'bootstrap.dialog',
  function ($scope, $meteor, $q, $rootScope, $stateParams, $timeout, $uibModal, bootstrapDialog) {
    var vm = this;
    vm.addTemplateAndEditDetails = addTemplateAndEditDetails;
    vm.addTemplateSetting = addTemplateSetting;
    vm.allDisplayCategories = [];
    vm.cancel=cancel;
    vm.deleteTemplate=deleteTemplate;
    vm.deleteTemplateSetting = deleteTemplateSetting;
    vm.editTemplateDetails = editTemplateDetails;
    vm.getTemplateById = getTemplateById;
    vm.getTemplateSetting = getTemplateSetting;
    vm.hasChanges = true;//false; currently considered too much work to track this properly
    vm.isTemplateSelected = isTemplateSelected;
    vm.onItemSelected = onItemSelected;
    vm.productHierarchy = {};
    vm.productHierarchyData = [];
    vm.recordAction = Constants.recordActions.view;
    vm.relevantTemplateTypesWithTemplates = [];
    vm.save=save;
    vm.showVariablesModal=showVariablesModal;
    vm.selectedTemplate;
    vm.selectTemplateId = selectTemplateId;
    vm.setUsageMode = setUsageMode;
    vm.showOption = showOption;
    vm.templateHasFocus = templateHasFocus;
    vm.templateLibrary = {};
    vm.controllerData = {templateLibraries: [vm.templateLibrary]};
    //vm.templateLibrary = $meteor.object(TemplateLibraries, $stateParams.templateLibraryId);
    vm.usageMode = Constants.usageModes.classicEdit;

    activate();

    function activate() {
      var subscriptionHandle;
      $meteor.subscribe('templateLibraries')
        .then(setSubscriptionHandle)
        .then(setTemplateLibrary)
        .then(setFullProductHierarchy)
        .then(setInitialTemplate)
        .catch(failure);

      $scope.$on('$destroy', function () {
        subscriptionHandle.stop();
      });

      function setSubscriptionHandle(handle) {
        subscriptionHandle = handle;
        return $q.when(null);
      }

      function setTemplateLibrary() {
        //vm.templateLibraries = $meteor.collection(TemplateLibraries);
        //vm.templateLibrary = TemplateLibraries.findOne($stateParams.templateLibraryId);
        vm.templateLibrary = $meteor.object(TemplateLibraries, $stateParams.templateLibraryId, false);
        vm.controllerData = {templateLibraries: [vm.templateLibrary]};

        //this did not work ...
        //$scope.$watch('vm.templateLibrary', function(newValue, oldValue) {
        //  vm.hasChanges=true;
        //}, true); //the true causes object equality check which is a deep watch

        //autorun only runs when final parameter is true,but I want the opposite
        //$meteor.autorun($scope, function () {
        //  vm.templateLibrary = $meteor.object(TemplateLibraries, $stateParams.templateLibraryId, true);
        //
        //  vm.hasChanges=true;
        //});

        return $q.when(null);
      }
    }


    // ToDo: implement permission checking!
    function canPerformAction(recordAction, template){
      return vm.recordAction != recordAction
        && vm.usageMode === Constants.usageModes.classicEdit
        && ((vm.recordAction === Constants.recordActions.view
          && (recordAction === Constants.recordActions.add
           || recordAction === Constants.recordActions.edit
           || recordAction === Constants.recordActions.delete
           || recordAction === Constants.recordActions.copy))
        || ((vm.recordAction === Constants.recordActions.add
        || vm.recordAction === Constants.recordActions.edit
        || vm.recordAction === Constants.recordActions.copy)
        && (recordAction === Constants.recordActions.cancel
        || recordAction === Constants.recordActions.save
        || recordAction === Constants.recordActions.view)));
    }

    function canLeave(){
      return true;//!vm.hasChanges;
    }

    function cancel() {
      if (vm.templateLibrary) {
        vm.templateLibrary.reset();
        //vm.hasChanges=false;
        if (vm.usageMode === Constants.usageModes.classicEdit){
          vm.recordAction = Constants.recordActions.view;
        }
      }
    }

    function save() {
      if (vm.templateLibrary) {
        return vm.templateLibrary.save()
          .then(saveSucceeded)
          .catch(failure);
      }
      else {
        return $q.when(null);
      }

      function saveSucceeded(){
        //vm.hasChanges=false;
        if (vm.usageMode === Constants.usageModes.classicEdit){
          vm.recordAction = Constants.recordActions.view;
        }
        setFullProductHierarchy();
      }
    }

    function showOption(recordAction, template){
      var templateIsSelectedTemplate = template === vm.selectedTemplate;

      if (recordAction === Constants.recordActions.add){
        return canLeave()
          && vm.usageMode !== Constants.usageModes.browse
          && canPerformAction(recordAction, template);
      }
      else if (recordAction === Constants.recordActions.copy){
        return canLeave()
          && vm.usageMode !== Constants.usageModes.browse
          && canPerformAction(recordAction, template);
      }
      else if (recordAction === Constants.recordActions.view){
        return canLeave()
          && canPerformAction(recordAction, template);
      }
      else if (recordAction === Constants.recordActions.delete){
        return canLeave()
          && vm.usageMode !== Constants.usageModes.browse
          && canPerformAction(recordAction, template);
      }
      else if (recordAction === Constants.recordActions.edit){
        return canLeave()
          && vm.usageMode !== Constants.usageModes.browse
          && (!templateIsSelectedTemplate  || !_.contains([Constants.recordActions.add,Constants.recordActions.copy,Constants.recordActions.edit], vm.recordAction))
          && canPerformAction(recordAction, template);
      }
      else if (recordAction === Constants.recordActions.save){
        return vm.hasChanges
          && vm.usageMode === Constants.usageModes.classicEdit
          && canPerformAction(recordAction, template);
      }
      else if (recordAction === Constants.recordActions.cancel){
        return vm.usageMode === Constants.usageModes.classicEdit
          && canPerformAction(recordAction, template);
      }
    }

    function setUsageMode(usageMode) {
      vm.usageMode = usageMode;
    }

    function deleteTemplate(template) {
      if (template) {
        bootstrapDialog.confirmationDialog("Delete template and its children", `Are you sure you want to delete '${template.name}' template and its related data and child templates?`)
          .then(confirmDelete, cancelDelete);
      } else {
        console.log("No template found to be deleted");
      }

      function cancelDelete(err) {
        if (err) {
          console.log(err);
        }
      }

      function confirmDelete() {
        TemplateLibrariesHelper.deleteTemplate(vm.controllerData, template.id);
        return save()
          .then(setTemplateTypeInfo, failure);
      }

    }

    //function deleteTemplate(template) {
    //  var confirmDelete = confirm(`Are you sure you want to delete ${template.name} and all its children?`);
    //  if (confirmDelete) {
    //    //cancel();
    //    TemplateLibrariesHelper.deleteTemplate(vm.templateLibrary, template);
    //    save();
    //  }
    //}

    function addTemplateAndEditDetails(templateType, parentTemplate) {
      if (!templateType) {
        templateType = vm.selectedTemplate ? vm.selectedTemplate.templateType : null;
      }
      if (!parentTemplate) {
        parentTemplate = TemplateLibrariesHelper.getTemplateParent(vm.controllerData, vm.selectedTemplate);
      }

      var templateToAdd = TemplateLibrariesHelper.addTemplate(vm.templateLibrary, templateType, parentTemplate);

      vm.recordAction = Constants.recordActions.add;
      selectTemplate(templateToAdd);
    }

    function editTemplateDetails(template) {
      vm.recordAction = Constants.recordActions.edit;
      selectTemplate(template);
    }

    function setInitialTemplate() {
      var initialTemplate;

      if (vm.templateLibrary) {
        if ($stateParams.templateItemId) {
          initialTemplate = _.find(vm.templateLibrary.templates, function (template) {
            return template.id === $stateParams.templateItemId
          });
        }
        else {
          initialTemplate = TemplateLibrariesHelper.getRootTemplate(vm.templateLibrary);
        }

        if (initialTemplate) {
          selectTemplate(initialTemplate);
        }
      }

      populateAllDisplayCategories();

      return $q.when(null);
    }

    function populateAllDisplayCategories() {
      vm.allDisplayCategories = [];

      if (vm.templateLibrary && vm.templateLibrary.templates) {
        vm.templateLibrary.templates.forEach(function (template) {
          template.templateSettings.forEach(function (templateSetting) {
            if (templateSetting.key === Constants.templateSettingKeys.displayCategory &&
              vm.allDisplayCategories.indexOf(templateSetting.value) == -1) {
              vm.allDisplayCategories.push(templateSetting.value);
            }
          });
        });
      }
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

    function selectTemplateId(templateId) {
      selectTemplate(getTemplateById(templateId));
    }

    function selectTemplate(template) {
      if (!template  || vm.selectedTemplate === template) {
        return;
      }

      vm.selectedTemplateId = template.id;
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

      var parentTemplate = TemplateLibrariesHelper.getTemplateParent(vm.controllerData, template, [Constants.dependency.optionalOverride]);
      if (parentTemplate) {
        populateBreadcrumbItems(breadcrumbItems, parentTemplate, false);
      }
    }

    function setTemplateTypeInfo(template) {
      template = template || vm.selectedTemplate;

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

      const parser = new Parser();
      // ignore easy bid functions and parser functions
      if (_.contains(_.keys(Formulas.easyBidFunctions), variableName) ||
        _.contains(_.keys(parser.unaryOps), variableName) ||
        _.contains(_.keys(parser.binaryOps), variableName) ||
        _.contains(_.keys(parser.functions), variableName) ||
        _.contains(_.keys(parser.consts), variableName)) {
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

      var templateChildren = TemplateLibrariesHelper.getTemplateChildren(vm.controllerData, template);
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

      // SpecificationGroups are like SubTemplates in that they should be ignored when ignoreSubTemplates is true
      if (ignoreSubTemplates && template.templateType === Constants.templateTypes.specificationGroup) {
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
      var templateChildren = TemplateLibrariesHelper.getTemplateChildren(vm.controllerData, template, [Constants.dependency.optionalOverride]);
      for (var i = 0; i < templateChildren.length; i++) {
        //Decided to only populate children if this template type is primary
        if (!ignoreSubTemplates || isThisTemplateTypePrimary) {
          populateTypicalRelevantTemplates(templateChildren[i], visitedTemplates, true, isThisTemplateTypePrimary, false, levelsFromSelected - 1);
        }
      }

      //Now populate helper templates for parent(s)
      var parentTemplates = TemplateLibrariesHelper.getTemplateParents(vm.controllerData, template, [Constants.dependency.optionalOverride]);
      for (var i = 0; i < parentTemplates.length; i++) {
        populateTypicalRelevantTemplates(parentTemplates[i], visitedTemplates, false, false, false, levelsFromSelected + 1);
      }
    }

    function getTemplateById(templateId) {
      return TemplateLibrariesHelper.getTemplateById(vm.controllerData, templateId);
    }

    function getTemplateSettingById(templateId, templateSettingId) {
      return TemplateLibrariesHelper.getTemplateSettingByIds(vm.controllerData, templateId, templateSettingId);
    }

    function getTemplateRelationshipById(templateRelationshipId) {
      return TemplateLibrariesHelper.getTemplateRelationshipById(vm.templateLibrary, templateRelationshipId);
    }

    function getTemplateSetting(templateId, templateSettingKey, templateSettingIndex) {
      return TemplateLibrariesHelper.getTemplateSettingByKeyAndIndex(vm.controllerData, templateId, templateSettingKey, templateSettingIndex);
    }

    function addTemplateSetting(templateId, templateSettingKey, templateSettingValue, order) {
      return TemplateLibrariesHelper.addTemplateSetting(vm.controllerData, templateId, templateSettingKey, templateSettingValue, order);
    }

    function deleteTemplateSetting(templateId, templateSettingId) {
      return TemplateLibrariesHelper.deleteTemplateSetting(vm.controllerData, templateId, templateSettingId);
    }

    function setFullProductHierarchy() {
      vm.productHierarchyData = [];

      if (vm.templateLibrary) {
        var rootTemplate = TemplateLibrariesHelper.getRootTemplate(vm.templateLibrary); //.getRawObject());
        var visitedTemplates = [];
        if (rootTemplate) {
          vm.productHierarchyData.push(addItemToTreeData(getTreeDataChildren(rootTemplate, visitedTemplates), rootTemplate));
        }
      }

      $timeout(function () {
        if (vm.productHierarchy.expand_all) {
          vm.productHierarchy.expand_all();
        }
      }, 50);

      return $q.when(null);
    }

    function getTreeDataChildren(template, visitedTemplates) {
      var templateChildren = TemplateLibrariesHelper.getTemplateChildren(vm.controllerData, template, [Constants.dependency.optionalOverride]);
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
    //      childrenArrayToAddThisTo = addProductToHierarchyAndReturnChildrenArray(null, TemplateLibrariesHelper.getTemplateParent(vm.templatelibrary, productTemplate));
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

    function showVariablesModal() {
      $uibModal.open({
        templateUrl: 'client/template-libraries/views/template-library-variables.html',
        controller: 'templateLibraryVariables',
        size: 'lg',
        resolve: {
          'vm': () => {
            return vm;
          },
        }
      });

      // modalInstance.result.then((selectedItem) => {
      //   if (this.isNew) {
      //     // new job needs a company selection and all of its appropriate children down to but not including an area.
      //     const companySelection = SelectionsHelper.addSelectionForTemplate(pendingChanges,
      //       this.companyTemplate, this.company._id, null, 0);
      //     SelectionsHelper.addSelectionsForTemplateChildren(pendingChanges,
      //       companySelection, this.companyTemplate, Constants.selectionAddingModes.handleAnything,
      //       this.areaTemplate);
      //     SelectionsHelper.initializeSelectionVariables(pendingChanges);
      //     this.initializeJobVariables(pendingChanges);
      //     pendingChanges.job.estimateTotal = this.getJobSubtotal(pendingChanges);
      //   }
      //   this.save(pendingChanges);
      // }, () => {
      //   console.log('Modal dismissed at: ' + new Date());
      //   this.cancel();
      // });
    }
  }]);
