angular.module("app").run(["$rootScope", "$location", function ($rootScope, $location) {
  $rootScope.$on("$stateChangeError", function (event, next, previous, error) {
    // We can catch the error thrown when the $requireUser promise is rejected
    // and redirect the user back to the main page
    if (error === "AUTH_REQUIRED") {
      $location.path("/parties");
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
      .state('customer', {
        url: '/customers/:userId?c',
        template: '<customer></customer>'
      })
      .state('customers', {
        url: '/customers?c&u',
        template: '<customers></customers>'
      })
      .state('billing', {
        url: '/billing',
        templateUrl: 'client/account/views/billing.html',
        controller: 'billing'
      })
      .state('billingPlan', {
        url: '/billing/plan',
        templateUrl: 'client/account/views/billing-plan.html',
        controller: 'billing'
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'client/account/views/signup.html',
        controller: 'signup'
      })
      .state('intro', {
        url: '/parties',
        templateUrl: 'client/parties/views/parties-list.html',
        controller: 'PartiesListCtrl'
      })
      .state('parties', {
        url: '/parties',
        templateUrl: 'client/parties/views/parties-list.html',
        controller: 'PartiesListCtrl'
      })
      .state('partyDetails', {
        url: '/parties/:partyId',
        templateUrl: 'client/parties/views/party-details.html',
        controller: 'PartyDetailsCtrl',
        resolve: {
          "currentUser": ["$meteor", function ($meteor) {
            return $meteor.requireUser();
          }]
        }
      })
      .state('companies', {
        url: '/companies',
        templateUrl: 'client/companies/views/company-list.html',
        controller: 'companies'
      })
      .state('companyDetails', {
        url: '/companies/:companyId',
        templateUrl: 'client/companies/views/company-details.html',
        controller: 'company',
        resolve: {
          "currentUser": ["$meteor", function ($meteor) {
            return $meteor.requireUser();
          }]
        }
      })
      .state('templateLibraryList', {
        url: '/libraries',
        templateUrl: 'client/template-libraries/views/template-library-list.html',
        controller: 'templateLibraryList',
        resolve: {
          "currentUser": ["$meteor", function ($meteor) {
            return $meteor.requireUser();
          }]
        }
      })
      .state('templateLibraryDetails', {
        abstract: true,
        url: '/libraries/:templateLibraryId',
        templateUrl: 'client/template-libraries/views/template-library-details.html',
        controller: 'templateLibraryDetails',
        controllerAs: 'vm',
        resolve: {
          "currentUser": ["$meteor", function ($meteor) {
            return $meteor.requireUser();
          }]
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
        }
      });
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
