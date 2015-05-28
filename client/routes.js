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
            });

        $urlRouterProvider.otherwise("/signup");
    }]);