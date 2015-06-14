//
//angular.module('app').directive('ebIsInRole', ['config', function (config) {
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
//}]);
