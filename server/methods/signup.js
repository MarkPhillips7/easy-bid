var Future = Npm.require('fibers/future');

Meteor.methods({
  createTrialClient: function (client) {
    console.log(JSON.stringify(client));
    check(client, {
      firstName: String,
      lastName: String,
      emailAddress: String,
      password: String,
      plan: String,
      card: {
        number: String,
        exp_month: String,
        exp_year: String,
        cvc: String
      }
    });

    var emailRegex = new RegExp(client.emailAddress, "i");
    //var lookupClient = Meteor.users.findOne({"emails.address": emailRegex});
    var lookupClient = Accounts.findUserByEmail(emailRegex);

    if (!lookupClient) {
      try {
        var newClient = new Future();

        Meteor.call('stripeCreateCustomer', client.card, client.emailAddress, function (error, stripeCustomer) {
          throwIfError(error, newClient);
          throwIfErrorMessage(stripeCustomer, newClient);
          var clientId = stripeCustomer.id,
              plan = client.plan;
          console.log("StripeCustomer: " + JSON.stringify(stripeCustomer));

          Meteor.call('stripeCreateSubscription', clientId, plan, function (error, stripeSubscription) {
            throwIfError(error, newClient);
            throwIfErrorMessage(stripeSubscription, newClient);
            var user = Accounts.createUser({
              email: client.emailAddress,
              password: client.password,
              profile: {
                firstName: client.firstName,
                lastName: client.lastName
              }
            });

            var subscription = {
              customerId: clientId,
              subscription: {
                plan: {
                  name: client.plan,
                  used: 0
                },
                payment: {
                  card: {
                    type: stripeCustomer.sources.data[0].brand,
                    lastFour: stripeCustomer.sources.data[0].last4
                  },
                  nextPaymentDue: stripeSubscription.current_period_end
                },
                status: stripeSubscription.status,
                ends: stripeSubscription.current_period_end
              }
            };

            Meteor.users.update(user, {
              $set: { 'profile.subscription': subscription }
            }, function (error, response) {
              throwIfError(error, newClient);
              newClient.return(user);
            });
          });
        });
        return newClient.wait();
      } catch (exception) {
        console.log("Exception: " + JSON.stringify(exception));
        throw new Meteor.Error('error-creating-user', 'Unexpected error creating user account');
      }
    } else {
      throw new Meteor.Error('user-exists', 'Sorry, that user email already exists!');
    }
  }
});

function throwIfError(error, future) {
  if (error) {
    console.log("Error: " + error);
    future.throw(error);
  }
}

function throwIfErrorMessage(response, future) {
  if (response && response["message"]) {
    console.log("Error in response: " + response);
    future.throw(new Error(response["message"]));
  }
}