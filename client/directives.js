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
    .directive('ebTemplateDetailsView', [function () {
      // Description:
      //  various template details for viewing based on template type
      // Usage:
      //  <data-eb-template-details-view data-template-library="templateLibrary" data-template="item"/>
      var directive = {
        link: link,
        restrict: 'E',
        scope: {
          template: "=",
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
          templateLibrary: "="
        }
      };
      return directive;

      function link(scope, element, attrs) {
        templateSettingLink(scope, element, attrs, false);
      }

    }]);

function templateSettingLink(scope, element, attrs, justOneSettingValue) {
  if (attrs.ebTemplateSettings === Constants.templateSettingKeys.displayCaption) {
    element.text(ItemTemplatesHelper.getDisplayCaption(scope.template));
  }
  else if (attrs.ebTemplateSettings === Constants.templateSettingKeys.unitsText) {
    element.html(ItemTemplatesHelper.getUnitsText(scope.template));
  }
  else if (attrs.ebTemplateSettings === Constants.templateSettingKeys.belongsTo) {
    var parentTemplate=TemplateLibrariesHelper.parentTemplate(scope.templateLibrary, scope.template);
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
