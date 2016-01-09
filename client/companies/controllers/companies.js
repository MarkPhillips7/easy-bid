angular.module("app").controller("companies", ['$scope', '$meteor',
  '$rootScope', '$state',
  function($scope, $meteor, $rootScope, $state) {
    var vm = this;
    vm.page = 1;
    vm.perPage = 3;
    vm.sort = {
      nameLower: 1
    };
    vm.orderProperty = '1';
    vm.canRemoveCompany = canRemoveCompany;
    vm.remove = remove;
    vm.pageChanged = pageChanged;
    vm.companies = $meteor.collection(function() {
      return Companies.find({}, {
        sort: $scope.getReactively('vm.sort')
      });
    });
    vm.search = '';

    $meteor.autorun($scope, function() {
      //For some reason vm.perPage and vm.page get resolved to NaN at first, so...
      if ($scope.vm) {
        $meteor.subscribe('companies', {
          limit: parseInt($scope.getReactively('vm.perPage')),
          skip: (parseInt($scope.getReactively('vm.page')) - 1) *
            parseInt($scope.getReactively('vm.perPage')),
          sort: $scope.getReactively('vm.sort')
        }, $scope.getReactively('vm.search')).then(function() {
          vm.companiesCount = $meteor.object(Counts,
            'numberOfCompanies', false);
        });
      }
    });

    function canRemoveCompany(company) {
      return Roles.userIsInRole($rootScope.currentUser, [Config.roles.manageUsers,
        Config.roles.systemAdmin
      ], Roles.GLOBAL_GROUP);
    }

    function remove(company) {
      vm.companies.splice(vm.companies.indexOf(company), 1);
    };

    function pageChanged(newPage) {
      vm.page = newPage;
    };

    $scope.$watch('vm.orderProperty', function() {
      if (vm.orderProperty)
        vm.sort = {
          nameLower: parseInt(vm.orderProperty)
        };
    });
  }
]);
