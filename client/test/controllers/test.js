angular.module("app").controller("test", ['$scope', '$meteor', '$rootScope', '$state',
  function ($scope, $meteor, $rootScope, $state) {
    var vm = this;

    $meteor.subscribe('jobs')
      .then(function (subscriptionHandle) {
        vm.jobs = $meteor.collection(Jobs);
      })
      .catch(subscriptionFailed);

    $meteor.subscribe('selections')
      .then(function (subscriptionHandle) {
        vm.selections = $meteor.collection(Selections);
      })
      .catch(subscriptionFailed);

    $meteor.subscribe('templateLibraries')
      .then(function (subscriptionHandle) {
        vm.templateLibraries = $meteor.collection(TemplateLibraries);
      })
      .catch(subscriptionFailed);

    $meteor.subscribe('companies')
      .then(function (subscriptionHandle) {
        vm.companies = $meteor.collection(Companies);

        $meteor.subscribe('coworkers', $scope.getReactively('vm.companies') && $scope.getReactively('vm.companies')[0]._id)
          .then(function (subscriptionHandle) {
            vm.coworkers = $meteor.collection(function () {
              //Want customerRole to be something like... 'roles.makdi3ksik6l29dnc' : { $in: ['user','manage-templates', 'manage-users'] }
              var coworkerRole = {};
              coworkerRole['roles.' + vm.companies[0]._id] = {$in: ['user', 'manage-templates', 'manage-users']};
              return Meteor.users.find(coworkerRole);
            });
          })
          .catch(subscriptionFailed);

        $meteor.subscribe('customers', $scope.getReactively('vm.companies') && $scope.getReactively('vm.companies')[0]._id)
          .then(function (subscriptionHandle) {
            vm.customers = $meteor.collection(function () {
              //Want customerRole to be something like... 'roles.makdi3ksik6l29dnc' : 'customer'
              var customerRole = {};
              customerRole['roles.' + vm.companies[0]._id] = 'customer';
              return Meteor.users.find(customerRole);
            });
          })
          .catch(subscriptionFailed);
      })
      .catch(subscriptionFailed);

    function subscriptionFailed(err) {
      console.log(err)
    }
  }]);