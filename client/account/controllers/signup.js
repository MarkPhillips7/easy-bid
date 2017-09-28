angular.module("app").controller("signup", ['$scope', '$meteor', '$rootScope', '$state',
  function ($scope, $meteor, $rootScope, $state) {
    var vm = this;
    vm.creatingClient = false;
    vm.client = {
      companyName: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    }

    vm.submit = submit;

    function submit() {
      vm.creatingClient = true;
      var dtoClient = {
        companyName: vm.client.companyName || `${vm.client.firstName} ${vm.client.lastName}`,
        firstName: vm.client.firstName,
        lastName: vm.client.lastName,
        emailAddress: vm.client.email,
        password: vm.client.password,
      };

      $meteor.call('createCompanyAndClient', dtoClient).then(
          function (data) {
            Meteor.loginWithPassword(vm.client.email, vm.client.password, function (error) {
              if (error) {
                alert(error.reason);
                vm.creatingClient = false;
              } else {
                console.log('success creating client');
                // $state.go('intro');
                vm.creatingClient = false;
              }
            });
          },
          function (err) {
            console.log('failed', err);
            vm.creatingClient = false;
            alert(err.reason);
          }
      );
    }
  }]);
