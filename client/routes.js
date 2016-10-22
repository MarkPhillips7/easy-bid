angular.module("app").run(["$rootScope", "$location", function ($rootScope, $location) {
  $rootScope.$on("$stateChangeError", function (event, next, previous, error) {
    // We can catch the error thrown when the $requireUser promise is rejected
    // and redirect the user back to the main page
    if (error === "AUTH_REQUIRED") {
      $location.path("/signup");
    }
  });
  $rootScope.Constants = Constants
}]);

angular.module("app").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
  function ($urlRouterProvider, $stateProvider, $locationProvider) {

    $locationProvider.html5Mode(true);

    $stateProvider
      .state('test', {
        url: '/test',
        template: '<test></test>'
      })
      .state('bid', {
        url: '/bids/:bidId?c&r',
        template: '<bid></bid>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('bids', {
        url: '/bids?c&r',
        template: '<bids></bids>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('customer', {
        url: '/customers/:userId?c',
        template: '<customer></customer>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('customers', {
        url: '/customers?c',
        template: '<customers></customers>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('billing', {
        url: '/billing',
        templateUrl: 'client/account/views/billing.html',
        controller: 'billing',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('billingPlan', {
        url: '/billing/plan',
        templateUrl: 'client/account/views/billing-plan.html',
        controller: 'billing',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'client/account/views/signup.html',
        controller: 'signup'
      })
      .state('companies', {
        url: '/companies',
        template: '<companies></companies>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('companyDetails', {
        url: '/companies/:companyId',
        template: '<company></company>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('templateLibraryList', {
        url: '/libraries',
        templateUrl: 'client/template-libraries/views/template-library-list.html',
        controller: 'templateLibraryList',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('templateLibraryDetails', {
        abstract: true,
        url: '/libraries/:templateLibraryId',
        templateUrl: 'client/template-libraries/views/template-library-details.html',
        controller: 'templateLibraryDetails',
        controllerAs: 'vm',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('templateLibraryDetails.item', {
        url: '/:templateItemId',
        //resolve: {
        //  "currentUser": ["$meteor", function ($meteor) {
        //    return $meteor.requireUser();
        //  }]
        //},
        views: {
          "left@templateLibraryDetails": {
            templateUrl: 'client/template-libraries/views/template-library-tree.html'
          },
          "middle@templateLibraryDetails": {
            templateUrl: 'client/template-libraries/views/template-library-item-details.html'
          },
          "right@templateLibraryDetails": {
            templateUrl: 'client/template-libraries/views/template-library-variables.html'
          }
        },
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      .state('lookups', {
        url: '/lookups',
        template: '<lookups></lookups>',
        resolve: {
          currentUser: ($q) => {
            if (Meteor.userId() == null) {
              return $q.reject('AUTH_REQUIRED');
            }
            else {
              return $q.resolve();
            }
          }
        }
      })
      ;
      //.state('templateLibraryItemList', {
      //  url: '/libraries/:templateLibraryId/items',
      //  templateUrl: 'client/template-libraries/views/template-library-item-list.html',
      //  controller: 'templateLibraryItemList',
      //  resolve: {
      //    "currentUser": ["$meteor", function ($meteor) {
      //      return $meteor.requireUser();
      //    }]
      //  }
      //})
      //.state('templateLibraryItemDetails', {
      //  url: '/libraries/:templateLibraryId/items/:templateItemId',
      //  templateUrl: 'client/template-libraries/views/template-library-details.html',
      //  controller: 'templateLibraryDetails',
      //  resolve: {
      //    "currentUser": ["$meteor", function ($meteor) {
      //      return $meteor.requireUser();
      //    }]
      //  }
      //});

    $urlRouterProvider.otherwise("/signup");
  }]);
