Meteor.startup(function () {
  check(Meteor.settings, {
    PrerenderIO: Match.Optional(Match.Any),
    "galaxy.meteor.com": Object,
    private: {
      jsreportonline: {
        authorizationHash: String,
        url: String
      },
      stripe: {
        secretKey: String
      },
      users: [
        Match.Any
      ]
    },
    public: {
      plans: [
        Match.Any
      ],
      stripe: {
        publishableKey: String
      }
    }
  });

  //This should fail
  //check(Meteor.settings, String);
});
