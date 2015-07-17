// App specific config settings should go here (model\02-config.js)
// Global config settings go in packages/globals/globals.js.

Config.roles = {
  systemAdmin: "system-admin",          //All-powerful user
  manageTemplates: "manage-templates",  //Can define variables and inputs
  manageUsers: "manage-users",          //Manage subscriptions and make payments
  user: "user",                         //Create bids for customers
  customer: "customer",                 //Customer that a bid was created for
  guest: "guest"                        //a visitor to the website
};