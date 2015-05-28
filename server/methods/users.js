Meteor.methods({
  checkUserPlan: function (user) {
    check(user, String);

    var getUser = Meteor.users.findOne({"_id": user}, {fields: {"subscription": 1}}),
        subscription = getUser.subscription;

    var availablePlans = Meteor.settings.public.plans;
    var currentPlan = _.find(availablePlans, function (plan) {
      return plan.name == subscription.plan.name;
    });
    var limit = currentPlan.limit;
    var amount = currentPlan.amount.usd;

    if (subscription && limit) {
      var planData = {
        subscription: subscription,
        limit: limit,// > 1 ? limit + " lists" : limit + " list",
        amount: amount
      }
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
          "subscription.plan.name": update.plan,
          "subscription.ends": update.date,
          "subscription.payment.nextPaymentDue": update.date,
          "subscription.status": update.status
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
