// Should be called by initializeEverything.js
/*
 * Set settings necessary for email support
 */
//Confidential information stored in settings.*.json
Initialization.initializeEmail = () => {
  Accounts.emailTemplates.from = Meteor.settings.private.email.fromAddress;
};
