angular.module("app").controller("billing", ['$scope', '$meteor', '$rootScope', '$state', 'bootstrap.dialog', 'toastr',
  function ($scope, $meteor, $rootScope, $state, bootstrapDialog, toastr) {
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
      $meteor.call('checkUserPlan', Meteor.userId())
          .then(checkUserPlanSuccess)
          .catch(checkUserPlanFailure);

      function checkUserPlanSuccess(data) {
        vm.plan = data;
        vm.completionPercent = 50;// * vm.plan.subscription.plan.used / vm.plan.limit;
        vm.loading = false;
      }

      function checkUserPlanFailure(err) {
        console.log('failed', err);
        vm.loading = false;
        alert(err.reason);
      }
    }

    // Stripe stores dates as seconds while we normally need it in milliseconds
    function stripeTimestampToTimestamp (epoch){
      return (epoch * 1000);
    }

    function cancelSubscription() {
      const confirmCancel = () => {
        Meteor.call('stripeCancelSubscription', function(error, response){
          if (error){
            toastr.error(error.reason, "Error");
          } else {
            if (response.error){
              toastr.error(response.error.message, "Error");
            } else {
              Session.set('currentUserPlan_' + Meteor.userId(), null);
              toastr.success("Subscription successfully canceled!");
            }
          }
        });
      };

      bootstrapDialog.confirmationDialog("Subscription Cancellation",
        "Are you sure you want to cancel? This means your subscription will no longer be active and your account will be disabled on the cancellation date. If you'd like, you can resubscribe later.")
        .then(confirmCancel);
    }

    function switchPlan (plan) {
      vm.switchingPlan=true;
      const confirmPlanChange = () => {
        $meteor.call('stripeUpdateSubscription', plan.name).then(
            function (data) {
              vm.switchingPlan= false;
              if (data && data.error){
                toastr.error(data.error.message, "Error");
              } else {
                Session.set('currentUserPlan_' + Meteor.userId(), null);
                toastr.success("Subscription successfully updated!");
                checkUserPlan();
              }
            },
            function (err) {
              console.log('failed', err);
              vm.switchingPlan = false;
              toastr.error(err.reason, "Error");
              //alert(err.reason);
            }
        );
      };
      const cancelPlanChange = () => {
        vm.switchingPlan= false;
        //downgradeUpgradeButton.button('reset');
      };
      bootstrapDialog.confirmationDialog("Plan Change", "Are you sure you want to change your plan?")
        .then(confirmPlanChange, cancelPlanChange);
    }
  }]);
