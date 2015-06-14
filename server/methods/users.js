Meteor.methods({
  checkUserPlan: function (user) {
    if (user == null){
      return false;
    }

    check(user, String);

    var getUser = Meteor.users.findOne({"_id": user}, {fields: {"profile.subscription": 1}});
    var subscription = getUser.profile.subscription;

    if (!subscription || !subscription.plan) {// || !currentPlan.amount){
      return false;
    }

    var availablePlans = Meteor.settings.public.plans;
    var currentPlan = _.find(availablePlans, function (plan) {
      return plan.name == subscription.plan.name;
    });
    var limit = currentPlan.limit;
    //var amount = currentPlan.amount.usd;

    if (subscription && limit) {
      var planData = {
        subscription: subscription,
        limit: limit, //,// > 1 ? limit + " lists" : limit + " list",
        amount: 29.99
      };
      return planData;
    } else {
      return false;
    }
  },
  updateUserPlan: function(update){
    // Check our update argument against our expected pattern.
    check(update, {
      auth: String,
      user: String,
      plan: String,
      status: String,
      date: Number
    });

    // Before we perform the update, ensure that the auth token passed is valid.
    if ( update.auth == SERVER_AUTH_TOKEN ){
      // If arguments are valid, continue with updating the user.
      Meteor.users.update(update.user, {
        $set: {
          "profile.subscription.plan.name": update.plan,
          "profile.subscription.ends": update.date,
          //"profile.subscription.payment.nextPaymentDue": update.date,
          "profile.subscription.status": update.status
        }
      }, function(error){
        if (error) {
          console.log(error);
        }
      });
    } else {
      throw new Meteor.Error('invalid-auth-token', 'Sorry, your server authentication token is invalid.');
    }
  }
});
