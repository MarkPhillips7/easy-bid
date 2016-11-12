import angular from 'angular';
import angularMeteor from 'angular-meteor';
import angularMoment from 'angular-moment';
import dirPagination from 'angular-utils-pagination';
import ngAnimate from 'angular-animate';
import ngMessages from 'angular-messages';
import formly from 'angular-formly';
import formlyBootstrap from 'angular-formly-templates-bootstrap';
import treeControl from 'angular-tree-control';
import 'angular-tree-control/css/tree-control.css';
import ngSanitize from 'angular-sanitize';
import toastr from 'angular-toastr';
import uiRouter from 'angular-ui-router';
import 'angular-ui-bootstrap';
import 'bootstrap-ui-datetime-picker/datetime-picker';
import 'isteven-angular-multiselect/isteven-multi-select';
import 'isteven-angular-multiselect/isteven-multi-select.css';
// import 'isteven-multi-select';

angular.module('app', [
  'accounts.ui',
  angularMeteor,
  'angularBootstrapNavTree',
  angularMoment,
  dirPagination,
  'common.bootstrap', // bootstrap dialog wrapper functions
  formly,
  formlyBootstrap,
  'isteven-multi-select',
  // multiSelect,
  ngAnimate,
  ngMessages,
  ngSanitize,
  toastr,
  treeControl,
  'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
  'ui.bootstrap.datetimepicker',
  uiRouter,
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
  })
  .run(function(formlyConfig, formlyValidationMessages) {
    formlyConfig.extras.errorExistsAndShouldBeVisibleExpression = 'fc.$touched || form.$submitted';
    formlyValidationMessages.addStringMessage('required', 'This field is required');
    formlyValidationMessages.messages.email = '$viewValue + " is not a valid email address"';
    formlyValidationMessages.messages.url = '$viewValue + " is not a valid url (expecting something like http://www.google.com)"';
  })
  .config(function (formlyConfigProvider) {
    formlyConfigProvider.setWrapper({
      name: 'validation',
      types: ['input'],
      templateUrl: 'client/lib/error-messages.html'
    });
  });

function onReady() {
  angular.bootstrap(document, ['app'], {
    // strictDi: true
  });
}

if (Meteor.isCordova)
  angular.element(document).on("deviceready", onReady);
else
  angular.element(document).ready(onReady);
