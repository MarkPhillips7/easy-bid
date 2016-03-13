angular.module('app', [
  'accounts.ui',
  'angular-meteor',
  'ngSanitize',
  'angularBootstrapNavTree',
  'angularMoment',
  'angularUtils.directives.dirPagination',
  'common.bootstrap', // bootstrap dialog wrapper functions
  'formly',
  'formlyBootstrap',
  'uiGmapgoogle-maps',
  'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
  'ui.router'
]);

angular.module('app')
  .run(function ($state) {
  })
  .run(function ($rootScope) {
    $rootScope.$on("$stateChangeError", console.log.bind(console));
    $rootScope.isInRole = function(role) {
      if (!_.isArray(role)) {
        role = [role];
      }
      return Roles.userIsInRole($rootScope.currentUser, role, Roles.GLOBAL_GROUP);
    }
  });

function onReady() {
  angular.bootstrap(document, ['app'], {
    strictDi: true
  });
}

if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);
