angular.module("app").controller("billing", ['$scope', '$meteor', '$rootScope', '$state',
  function ($scope, $meteor, $rootScope, $state) {
    var vm = this;
    vm.cancelSubscription=cancelSubscription;
    vm.completionPercent = 0;
    vm.loading = true;
    vm.plan = {};
    vm.plans = Meteor.settings.public.plans;
    vm.stripeTimestampToTimestamp = stripeTimestampToTimestamp;
    vm.switchPlan=switchPlan;
    vm.switchingPlan= false;

    vm.companies = $meteor.collection(Companies, false).subscribe('companies');

    checkUserPlan();

    function checkUserPlan() {
      $meteor.call('checkUserPlan', Meteor.userId()).then(
          function (data) {
            vm.plan = data;
            vm.completionPercent = 50;// * vm.plan.subscription.plan.used / vm.plan.limit;
            vm.loading = false;
          },
          function (err) {
            console.log('failed', err);
            vm.loading = false;
            alert(err.reason);
          }
      );
    }

    // Stripe stores dates as seconds while we normally need it in milliseconds
    function stripeTimestampToTimestamp (epoch){
      return (epoch * 1000);
    }

    function cancelSubscription() {
      var confirmCancel = confirm("Are you sure you want to cancel? This means your subscription will no longer be active and your account will be disabled on the cancellation date. If you'd like, you can resubscribe later.");
      if (confirmCancel){
        Meteor.call('stripeCancelSubscription', function(error, response){
          if (error){
            Bert.alert(error.reason, "danger");
          } else {
            if (response.error){
              Bert.alert(response.error.message, "danger");
            } else {
              Session.set('currentUserPlan_' + Meteor.userId(), null);
              Bert.alert("Subscription successfully canceled!", "success");
            }
          }
        });
      }
    }

    function switchPlan (plan) {
      vm.switchingPlan=true;
      var confirmPlanChange = confirm("Are you sure you want to change your plan?");
      if (confirmPlanChange){
        $meteor.call('stripeUpdateSubscription', plan.name).then(
            function (data) {
              vm.switchingPlan= false;
              if (data && data.error){
                Bert.alert(data.error.message, "danger");
              } else {
                Session.set('currentUserPlan_' + Meteor.userId(), null);
                Bert.alert("Subscription successfully updated!", "success");
                checkUserPlan();
              }
            },
            function (err) {
              console.log('failed', err);
              vm.switchingPlan = false;
              Bert.alert(err.reason, "danger");
              //alert(err.reason);
            }
        );
      } else {
        vm.switchingPlan= false;
        //downgradeUpgradeButton.button('reset');
      }
    }
  }]);