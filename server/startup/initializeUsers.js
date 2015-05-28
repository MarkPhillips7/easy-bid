/*
 * Generate Test Accounts
 * Creates a collection of test accounts automatically on startup.
 */

// Create an array of user accounts.
var users = [
// Note: our demo user here is purely for mock purposes and does not correspond
// to a real customer on Stripe.
  {
    name: "Andy Warhol",
    email: "andy@warhol.com",
    password: "your15minutesisup",
    subscription: {
      plan: {
        name: "basic",
        used: 5
      },
      payment: {
        card: {
          type: "Visa",
          lastFour: "1234"
        },
        nextPaymentDue: ( new Date() ).getTime()
      },
      status: "active",
      ends: ( new Date() ).getTime()
    },
    customerId: "13951jfoijf13oij"
  }
];

// Loop through array of user accounts.
for(i=0; i < users.length; i++){
  // Check if the user already exists in the DB.
  var user      = users[i],
      userEmail = user.email,
      checkUser = Meteor.users.findOne({"emails.address": userEmail});

  // If an existing user is not found, create the account.
  if( !checkUser ){
    // Create the new user.
    var userId = Accounts.createUser({
      email: userEmail,
      password: user.password,
      profile: {
        name: user.name
      }
    });

    if (userId){
      Meteor.users.update(userId,{
        $set: {
          subscription: user.subscription,
          customerId: user.customerId
        }
      }, function(error, response){
        if (error) {
          console.log(error);
        } else {
          // Once the user is available, give them a set of todo lists equal to their
          // plan limit. Wrap this in a setTimeout to give our collection a chance to
          // be initialized on the server.
          for(i=0; i < user.subscription.plan.used; i++){
            Meteor.call('insertTodoList', userId, function(error){
              if (error) {
                console.log(error);
              }
            });
          }
        }
      });
    }
  }
}
