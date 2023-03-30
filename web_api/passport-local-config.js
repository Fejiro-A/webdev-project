const { MongoClient } = require('mongodb');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const constants = require('./constants');

var User = client.db().collection(constants.MONGO_USER_COLLECTION_NAME);

/**
 * Configure passport local username and password stategy
 * @param {MongoClient} client 
 */
function configure(client) {
    User = client.db().collection(constants.MONGO_USER_COLLECTION_NAME);
    passport.use(new LocalStrategy(function (username, password, done) {
        // Look for user with the supplied username
        User.findOne({ username: username }, function (err, user) {
            // Report error if something went wrong
            if (err) return done(err);

            // Block request if user could not be found or the password is wrong
            if (!user) return done(null, false);

            if (user.password != password) return done(null, false);

            // Authenticate
            return done(null, user);
        });
    }));
}

module.exports = configure;