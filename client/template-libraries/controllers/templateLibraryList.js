angular.module("app").controller("templateLibraryList", ['$scope', '$meteor', '$rootScope', '$state',
  function ($scope, $meteor, $rootScope, $state) {
    var vm = this;
    vm.clone = clone;
    vm.getCompanyName = getCompanyName;
    vm.page = 1;
    vm.perPage = Config.defaultRecordsPerPage;
    vm.sort = {name: 1};
    vm.orderProperty = '1';
    vm.pageChanged = pageChanged;
    vm.templateLibraries = $meteor.collection(function () {
      return TemplateLibraries.find({}, {
        sort: $scope.getReactively('vm.sort')
      });
    });
    vm.search = '';

    $meteor.subscribe('companies')
        .then(function (subscriptionHandle) {
          vm.companies = $meteor.collection(Companies);
        });

    $meteor.autorun($scope, function () {
      //For some reason vm.perPage and vm.page get resolved to NaN at first, so...
      if ($scope.vm) {
        $meteor.subscribe('templateLibraries', {
          limit: parseInt($scope.getReactively('vm.perPage')),
          skip: (parseInt($scope.getReactively('vm.page')) - 1) * parseInt($scope.getReactively('vm.perPage')),
          sort: $scope.getReactively('vm.sort')
        }, $scope.getReactively('vm.search')).then(function () {
          vm.templateLibraryListCount = $meteor.object(Counts, 'numberOfTemplateLibraries', false);
        });
      }
    });

    $scope.$watch('vm.orderProperty', function () {
      if (vm.orderProperty)
        vm.sort = {name: parseInt(vm.orderProperty)};
    });

    function pageChanged(newPage) {
      vm.page = newPage;
    };

    function clone(templateLibrary) {
      // ToDo: implement (use TemplateLibrariesHelper.cloneTemplateLibrary)
    }

    function getCompanyName(companyId){
      var company = _.find(vm.companies, function(company){ return company._id === companyId; });

      return company && company.name || 'Easy Bid';
    }
  }]);
