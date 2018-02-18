// Should be called by initializeEverything.js
/*
 * Set settings necessary for email support
 */
//Confidential information stored in settings.*.json
Initialization.initializeEmail = () => {
  Accounts.emailTemplates.siteName = "Easy Bid";
  Accounts.emailTemplates.from = Meteor.settings.private.email.fromAddress;

  Accounts.emailTemplates.enrollAccount.subject = (user) => {
    return `Welcome to Easy Bid, ${user.profile.firstName}`;
  };

  Accounts.emailTemplates.enrollAccount.text = (user, url) => {
    return `${user.profile.firstName},

You have been selected to join Easy Bid! To activate your account, simply click the link below:

${url}`;
  };

  Accounts.emailTemplates.resetPassword.from = () => {
    // Overrides the value set in `Accounts.emailTemplates.from` when resetting
    // passwords.
    return 'Easy Bid Password Reset <no-reply@nowhere.com>';
  };

  Accounts.emailTemplates.verifyEmail = {
     subject() {
        return "Activate your account now!";
     },
     text(user, url) {
        return `Hey ${user.profile.firstName}!

Thank you for signing up with Easy Bid. Verify your e-mail by following the link below:

${url}`;
     }
  };
};
