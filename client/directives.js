angular.module('app')
//    .directive('ebIsInRole', ['config', function (config) {
//  //Usage:
//  //<img data-eb-is-in-role="{{s.speaker.imageSource}}"/>
//  var basePath = config.imageSettings.imageBasePath;
//  var unknownImage = config.imageSettings.unknownPersonImageSource;
//  var directive = {
//    link: link,
//    restrict: 'A'
//  };
//  return directive;
//
//  function link(scope, element, attrs) {
//    attrs.$observe('ccImgPerson', function (value) {
//      value = basePath + (value || unknownImage);
//      attrs.$set('src', value);
//    });
//  }
//}])

  .directive('ebRelevantTemplateTypeView', [function () {
    // Description:
    //  grid displaying template children based on child template type
    // Usage:
    //    <eb-relevant-template-type-view
    //      data-vm="vm"
    //      data-template-library="templateLibrary"
    //      data-template="template"
    //      data-relevant-template-type-with-templates="relevantTemplateTypeWithTemplates">
    //    </eb-relevant-template-type-view>
    var directive = {
      link: link,
      restrict: 'E',
      scope: {
        template: "=",
        templateId: "=",
        templateLibrary: "=",
        vm: "=",
        relevantTemplateTypeWithTemplates: "="
      },
      templateUrl: 'client/template-libraries/views/relevant-template-type-view.ng.html'
    };
    return directive;

    function setRelevantTemplateTypeInfo(scope, templateType) {
      scope.relevantTemplateTypeInfo = null;

      if (scope.template && templateType) {
        scope.relevantTemplateTypeInfo = _.find(TemplateTypeInfoList, function (templateTypeInfo) {
          return templateTypeInfo.templateType === templateType;
        });
      }
    }

    function link(scope, element, attrs) {
      element.click()
      setRelevantTemplateTypeInfo(scope,
        scope.relevantTemplateTypeWithTemplates ? scope.relevantTemplateTypeWithTemplates.templateType : null);

      scope.$watch('relevantTemplateTypeWithTemplates.templateType', function (newValue, oldValue) {
        setRelevantTemplateTypeInfo(scope, newValue);
      }, true);
    }

  }])

  .directive('ebRelevantTemplatesView', [function () {
    // Description:
    //  div with various grids displaying child templates based
    // Usage:
    //  <eb-relevant-templates-view
    //    data-vm="vm"
    //    data-template-library="templateLibrary"
    //    data-template="vm.template"
    //    data-relevant-template-types-with-templates="vm.relevantTemplateTypesWithTemplates"/>
    var directive = {
      //link: link,
      restrict: 'E',
      scope: {
        vm: "=",
        template: "=",
        templateId: "=",
        templateLibrary: "=",
        relevantTemplateTypesWithTemplates: "="
      },
      templateUrl: 'client/template-libraries/views/relevant-templates-view.ng.html'
    };
    return directive;

    //function link(scope, element, attrs) {
    //    if (scope.template) {
    //        scope.templateTypeInfo = $.grep(model.templateTypeInfoList, function (templateTypeInfo) {
    //            return templateTypeInfo.templateType === scope.template.templateType;
    //        })[0];
    //    }
    //}
  }])
  .directive('ebTemplateDetailsEdit', [function () {
    // Description:
    //  various template details for viewing based on template type
    // Usage:
    //  <data-eb-template-details-edit data-template-library="templateLibrary" data-template="item"/>
    var directive = {
      link: link,
      restrict: 'E',
      scope: {
        template: "=",
        templateId: "=",
        templateLibrary: "=",
        vm: "="
      },
      templateUrl: 'client/template-libraries/views/template-details-edit.ng.html'
    };
    return directive;

    function setTemplateTypeInfo(scope, templateType) {
      scope.templateTypeInfo = null;

      if (templateType) {
        scope.templateTypeInfo = _.find(TemplateTypeInfoList, function (templateTypeInfo) {
          return templateTypeInfo.templateType === templateType;
        });
      }
    }

    function link(scope, element, attrs) {
      setTemplateTypeInfo(scope, scope.template ? scope.template.templateType : null);

      scope.$watch('template.templateType', function (newValue, oldValue) {
        setTemplateTypeInfo(scope, newValue);
      }, true);
    }
  }])
  .directive('ebTemplateDetailsView', [function () {
    // Description:
    //  various template details for editing based on template type
    // Usage:
    //  <data-eb-template-details-view data-template-library="templateLibrary" data-template="item"/>
    var directive = {
      link: link,
      restrict: 'E',
      scope: {
        template: "=",
        templateId: "=",
        templateLibrary: "=",
        vm: "="
      },
      templateUrl: 'client/template-libraries/views/template-details-view.ng.html'
    };
    return directive;

    function setTemplateTypeInfo(scope, templateType) {
      scope.templateTypeInfo = null;

      if (templateType) {
        scope.templateTypeInfo = _.find(TemplateTypeInfoList, function (templateTypeInfo) {
          return templateTypeInfo.templateType === templateType;
        });
      }
    }

    function link(scope, element, attrs) {
      setTemplateTypeInfo(scope, scope.template ? scope.template.templateType : null);

      scope.$watch('template.templateType', function (newValue, oldValue) {
        setTemplateTypeInfo(scope, newValue);
      }, true);
    }
  }])
  .directive('ebTemplateSettings', [function () {
    // Description:
    //  Displays template setting values
    // Usage:
    //  <th data-ng-repeat="columnTemplate in vm.columnTemplates" data-eb-template-settings="DisplayCategory" data-template="columnTemplate"></th>
    var directive = {
      link: link,
      restrict: 'A',
      scope: {
        template: "=",
        templateId: "=",
        templateLibrary: "=",
        vm: "="
      }
    };
    return directive;

    function link(scope, element, attrs) {
      templateSettingLink(scope, element, attrs, false);
    }

  }])

  .directive('ebTemplateSettingsEdit', [function () {
  // Description:
  //  Provides way to edit template setting values for a given template setting key
  // Usage:
  //<eb-template-settings-edit
  //data-template-setting-info="templateSettingInfo"
  //data-template="template"
  //data-input-index="$index"
  //data-vm="vm">
  //</eb-template-settings-edit>
  var directive = {
    link: link,
    restrict: 'E',
    scope: {
      inputIndex: "=",
      template: "=",
      templateId: "=",
      templateSettingInfo: "=",
      vm: "="
    },
    template: '<div ng-include="contentUrl"></div>'
  };
  return directive;

  function loadTemplateSettings(scope) {
    scope.templateSettings = [];

    if (scope.template && scope.template.templateSettings) {
      scope.templateSettings = _.filter(scope.template.templateSettings, function (templateSetting) {
        return (templateSetting.key === scope.templateSettingInfo.templateSettingKey);
      });
    }
  }

  function link(scope, element, attrs) {
    var numberTemplatesToAdd;
    var startingOrder;
    var i;
    var matchingOption;

    loadTemplateSettings(scope);

    scope.addTemplateSetting = function(templateSettingKey, templateSettingValue, order) {
      scope.templateSettings.push(scope.vm.addTemplateSetting(scope.templateId, templateSettingKey, templateSettingValue, order));
    };

    scope.deleteTemplateSetting = function(templateSetting) {
      var indexOfTemplateSetting = scope.templateSettings.indexOf(templateSetting);
      scope.vm.deleteTemplateSetting(scope.templateId, templateSetting);

      if (indexOfTemplateSetting > -1) {
        scope.templateSettings.splice(indexOfTemplateSetting, 1);
      }
    };

    //default content is an input
    scope.contentUrl = 'client/template-libraries/views/template-settings-edit-input.ng.html';

    if (scope.vm && scope.templateSettingInfo) {
      if (scope.templateSettingInfo.minCount > 0) {
        numberTemplatesToAdd = Math.max(0, scope.templateSettingInfo.minCount - scope.templateSettings.length);
        startingOrder = scope.templateSettings.length > 0 ? scope.templateSettings[scope.templateSettings.length - 1] : 0;
      }

      //Add template settings if the minimum number has not been reached
      for (i = 0; i < numberTemplatesToAdd; i += 1) {
        scope.templateSettings.push(
          scope.vm.addTemplateSetting(scope.templateId,
            scope.templateSettingInfo.templateSettingKey,
            scope.templateSettingInfo.templateSettingValue,
            i + startingOrder));
      }
    }

    if (scope.templateSettingInfo && scope.templateSettingInfo.templateSettingKey === Constants.templateSettingKeys.displayCategory) {
      scope.options = [{
        value:'PrimaryTableColumn',
        name:'Main Grid Column'
      },{
        value:'Primary',
        name: 'Primary Tab'
      }];

      //Other existing DisplayCategory values should make up remaining options
      if (scope.vm.allDisplayCategories) {
        scope.vm.allDisplayCategories.forEach(function(displayCategory){
          if (displayCategory !== "PrimaryTableRow") {
            matchingOption = _.filter(scope.options, function (option) {
              return option.value == displayCategory;
            })[0];
            if (!matchingOption) {
              scope.options.push({
                value: displayCategory,
                name: displayCategory + ' Tab'
              });
            }
          }
        });
        scope.canAddOption = true;
      }
    }
    else if (scope.templateSettingInfo.options) {
      scope.options = scope.templateSettingInfo.options;
    }

    if (scope.options) {
      scope.contentUrl = 'client/template-libraries/views/template-settings-edit-select.ng.html';
    }
    //
    //scope.$watch('template.templateSettings', function (newValue, oldValue) {
    //    loadTemplateSettings(scope);
    //}, true);
  }
}]);

function templateSettingLink(scope, element, attrs, justOneSettingValue) {
  if (attrs.ebTemplateSettings === Constants.templateSettingKeys.displayCaption) {
    element.text(ItemTemplatesHelper.getDisplayCaption(scope.template));
  }
  else if (attrs.ebTemplateSettings === Constants.templateSettingKeys.unitsText) {
    element.html(ItemTemplatesHelper.getUnitsText(scope.vm.getTemplateById(scope.templateId)));
  }
  else if (attrs.ebTemplateSettings === Constants.templateSettingKeys.belongsTo) {
    var parentTemplate = TemplateLibrariesHelper.parentTemplate(scope.templateLibrary, scope.template);
    element.text(parentTemplate ? parentTemplate.name : '');
  }
  else {
    if (justOneSettingValue) {
      element.text(ItemTemplatesHelper.getTemplateSettingValueForTemplate(scope.template, attrs.ebTemplateSetting));
    }
    else {
      element.text(ItemTemplatesHelper.getTemplateSettingValuesForTemplate(scope.template, attrs.ebTemplateSettings));
    }
  }
}
