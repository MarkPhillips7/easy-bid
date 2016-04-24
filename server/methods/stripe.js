import Fiber from 'fibers';
import Future from 'fibers/future';
import _Stripe from 'stripe';

var secret = Meteor.settings.private.stripe.secretKey;
var Stripe = _Stripe(secret);


Meteor.methods({
  stripeCreateCustomer: function (card, email) {
    console.log(JSON.stringify(card));
    check(card, {
        number: String,
        exp_month: String,
        exp_year: String,
        cvc: String
      });
    console.log(JSON.stringify(email));
    check(email, String);

    var stripeCustomer = new Future();

    Stripe.customers.create({
      card: card,
      email: email
    }, function (error, customer) {
      if (error) {
        stripeCustomer.return(error);
      } else {
        stripeCustomer.return(customer);
      }
    });

    return stripeCustomer.wait();
  },

  stripeCreateSubscription: function(customer, plan){
    console.log(JSON.stringify(customer));
    console.log(JSON.stringify(plan));
    check(customer, String);
    check(plan, String);

    var stripeSubscription = new Future();

    Stripe.customers.createSubscription(customer, {
      plan: plan
    }, function(error, subscription){
      console.log(JSON.stringify(error));
      console.log(JSON.stringify(subscription));
      if (error) {
        stripeSubscription.return(error);
      } else {
        stripeSubscription.return(subscription);
      }
    });

    return stripeSubscription.wait();

  },

  stripeUpdateSubscription: function(plan){
    check(plan, String);

    var stripeUpdateSubscription = new Future();

    var user    = Meteor.userId();
    var getUser = Meteor.users.findOne({"_id": user}, {fields: {"stripeCustomerId": 1}});

    Stripe.customers.updateSubscription(getUser.stripeCustomerId, {
      plan: plan
    }, function(error, subscription){
      if (error) {
        stripeUpdateSubscription.return(error);
      } else {
        Fiber(function(){
          var update = {
            auth: SERVER_AUTH_TOKEN,
            user: user,
            plan: plan,
            status: subscription.status,
            date: subscription.current_period_end
          };
          Meteor.call('updateUserPlan', update, function(error, response){
            if (error){
              stripeUpdateSubscription.return(error);
            } else {
              stripeUpdateSubscription.return(response);
            }
          });
        }).run();
      }
    });

    return stripeUpdateSubscription.wait();
  }
});
