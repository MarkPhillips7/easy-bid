Package.describe({
  name: 'markphillips7:globals',
  version: '0.0.1',
  // Brief, one-line summary of the package.
  summary: 'Global variables and config settings',
  // URL to the Git repository containing the source code for this package.
  git: '',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: null//'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.addFiles('globals.js');
  api.export('Config');
  api.export('Constants');
  api.export('Initialization');
  api.export('Schema');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('markphillips7:globals');
  api.addFiles('globals-tests.js');
});
