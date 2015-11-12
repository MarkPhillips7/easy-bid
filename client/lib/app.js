angular.module('app', [
  'angular-meteor',
  'angularMoment',
  'formly',
  'formlyBootstrap',
  'ui.router',
  'angularUtils.directives.dirPagination',
  'uiGmapgoogle-maps',
  'common.bootstrap', // bootstrap dialog wrapper functions
  'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
  'angularBootstrapNavTree'
]);

angular.module('app')
  .run(function ($state) {
  })
  .run(function ($rootScope) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));
  });

function onReady() {
  angular.bootstrap(document, ['app']);
}

if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);

