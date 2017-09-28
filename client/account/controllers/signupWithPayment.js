angular.module("app").controller("signupWithPayment", ['$scope', '$meteor', '$rootScope', '$state',
  function ($scope, $meteor, $rootScope, $state) {
    var vm = this;
    vm.creatingTrialClient = false;
    vm.plans = Meteor.settings.public.plans;
    vm.client = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      planName: vm.plans[0].name,
      creditCard: {
        cardNumber: "",
        expirationMonth: "",
        expirationYear: "",
        cvc: ""
      }
    }

    vm.planSelected = planSelected;
    vm.submit = submit;

    vm.creditCardFields = [
      {
        key: 'cardNumber',
        type: 'input',
        templateOptions: {
          label: 'Card Number',
          placeholder: 'Card Number',
          required: true
        }
      },
      {
        key: 'expirationMonth',
        type: 'select',
        templateOptions: {
          label: 'Exp. Mo.',
          placeholder: 'Exp. Mo.',
          required: true,
          "valueProp": "name",
          "options": [
            {
              "name": "01"
            },
            {
              "name": "02"
            },
            {
              "name": "03"
            },
            {
              "name": "04"
            },
            {
              "name": "05"
            },
            {
              "name": "06"
            },
            {
              "name": "07"
            },
            {
              "name": "08"
            },
            {
              "name": "09"
            },
            {
              "name": "10"
            },
            {
              "name": "11"
            },
            {
              "name": "12"
            }]
        }
      },
      {
        key: 'expirationYear',
        type: 'input',
        templateOptions: {
          label: 'Exp. Yr.',
          placeholder: 'Exp. Yr.',
          required: true
        }
      },
      {
        key: 'cvc',
        type: 'input',
        templateOptions: {
          label: 'CVC',
          description: 'Three digits on the back of the card',
          required: true
        }
      }
    ];

    function planSelected(plan) {
      vm.client.planName = plan.name;
    }

    function submit() {
      vm.creatingTrialClient = true;
      var dtoClient = {
        firstName: vm.client.firstName,
        lastName: vm.client.lastName,
        emailAddress: vm.client.email,
        password: vm.client.password,
        plan: vm.client.planName,
        card: {
          number: vm.client.creditCard.cardNumber,
          exp_month: vm.client.creditCard.expirationMonth,
          exp_year: vm.client.creditCard.expirationYear,
          cvc: vm.client.creditCard.cvc
        }
      };

      $meteor.call('createTrialClient', dtoClient).then(
          function (data) {
            Meteor.loginWithPassword(vm.client.email, vm.client.password, function (error) {
              if (error) {
                alert(error.reason);
                vm.creatingTrialClient = false;
              } else {
                console.log('success creating trial client');
                $state.go('intro');
                vm.creatingTrialClient = false;
              }
            });
          },
          function (err) {
            console.log('failed', err);
            vm.creatingTrialClient = false;
            alert(err.reason);
          }
      );
    }
  }]);
