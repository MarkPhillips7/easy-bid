Meteor.startup(function () {
    check(Meteor.settings, {
        private: {
            stripe: {
                secretKey: String
            }
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