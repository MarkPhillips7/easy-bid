angular.module("app").controller("test", ['$scope', '$meteor', '$rootScope', '$state',
  function ($scope, $meteor, $rootScope, $state) {
    var vm = this;

    $meteor.subscribe('templateLibraries')
        .then(function (subscriptionHandle) {
          vm.templateLibraries = $meteor.collection(TemplateLibraries);
          vm.templateLibrary = $meteor.object(TemplateLibraries, vm.templateLibraries[0]._id);
        });

    $meteor.subscribe('companies')
        .then(function (subscriptionHandle) {
          vm.companies = $meteor.collection(Companies);

          $meteor.subscribe('coworkers', $scope.getReactively('vm.companies') && $scope.getReactively('vm.companies')[0].name)
              .then(function (subscriptionHandle) {
                vm.coworkers = $meteor.collection(function() {
                  //Want customerRole to be something like... 'roles.We Make Cabinets' : { $in: ['user','manage-templates', 'manage-users'] }
                  var coworkerRole = {};
                  coworkerRole['roles.' + vm.companies[0].name] = { $in: ['user','manage-templates', 'manage-users'] };
                  return Meteor.users.find(coworkerRole);
                });
              });

          $meteor.subscribe('customers', $scope.getReactively('vm.companies') && $scope.getReactively('vm.companies')[0].name)
              .then(function (subscriptionHandle) {
                vm.customers = $meteor.collection(function() {
                  //Want customerRole to be something like... 'roles.We Make Cabinets' : 'customer'
                  var customerRole = {};
                  customerRole['roles.' + vm.companies[0].name] = 'customer';
                  return Meteor.users.find(customerRole);
                });
              });
        });

  }]);