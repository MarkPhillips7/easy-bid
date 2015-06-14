angular.module("app").run(["$rootScope", "$location", function ($rootScope, $location) {
    $rootScope.$on("$stateChangeError", function (event, next, previous, error) {
        // We can catch the error thrown when the $requireUser promise is rejected
        // and redirect the user back to the main page
        if (error === "AUTH_REQUIRED") {
            $location.path("/parties");
        }
    });
}]);

angular.module("app").config(['$urlRouterProvider', '$stateProvider', '$locationProvider',
    function ($urlRouterProvider, $stateProvider, $locationProvider) {

        $locationProvider.html5Mode(true);

        $stateProvider
            .state('test', {
              url: '/test',
              templateUrl: 'client/test/views/test.ng.html',
              controller: 'test'
            })
            .state('billing', {
              url: '/billing',
              templateUrl: 'client/account/views/billing.ng.html',
              controller: 'billing'
            })
            .state('billingPlan', {
              url: '/billing/plan',
              templateUrl: 'client/account/views/billing-plan.ng.html',
              controller: 'billing'
            })
            .state('signup', {
              url: '/signup',
              templateUrl: 'client/account/views/signup.ng.html',
              controller: 'signup'
            })
            .state('intro', {
              url: '/parties',
              templateUrl: 'client/parties/views/parties-list.ng.html',
              controller: 'PartiesListCtrl'
            })
            .state('parties', {
                url: '/parties',
                templateUrl: 'client/parties/views/parties-list.ng.html',
                controller: 'PartiesListCtrl'
            })
            .state('partyDetails', {
                url: '/parties/:partyId',
                templateUrl: 'client/parties/views/party-details.ng.html',
                controller: 'PartyDetailsCtrl',
                resolve: {
                    "currentUser": ["$meteor", function ($meteor) {
                        return $meteor.requireUser();
                    }]
                }
            })
            .state('companies', {
              url: '/companies',
              templateUrl: 'client/companies/views/company-list.ng.html',
              controller: 'companies'
            })
            .state('companyDetails', {
              url: '/companies/:companyId',
              templateUrl: 'client/companies/views/company-details.ng.html',
              controller: 'companies',
              resolve: {
                "currentUser": ["$meteor", function ($meteor) {
                  return $meteor.requireUser();
                }]
              }
            });

        $urlRouterProvider.otherwise("/signup");
    }]);