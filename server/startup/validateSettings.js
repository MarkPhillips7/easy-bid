Meteor.startup(function () {
  check(Meteor.settings, {
    PrerenderIO: Match.Optional(Match.Any),
    "galaxy.meteor.com": Object,
    private: {
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
