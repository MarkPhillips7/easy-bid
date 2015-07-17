angular.module('app',[
  'angular-meteor',
  'angularMoment',
  'formly',
  'formlyBootstrap',
  'ui.router',
  'angularUtils.directives.dirPagination',
  'uiGmapgoogle-maps',
  'angularBootstrapNavTree'
]);

angular.module('app').run(function($state){});

function onReady() {
  angular.bootstrap(document, ['app']);
}

if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);

