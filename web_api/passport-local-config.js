const { MongoClient } = require('mongodb');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const constants = require('./constants');
const bcrypt = require('bcrypt');

/**
 * Configure passport local username and password stategy
 * @param {MongoClient} client 
 */
async function configure(client) {
    let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME);
    passport.use(new LocalStrategy(function (username, password, done) {
        // Look for user with the supplied username
        User.find({ username: username }).limit(1).next()
            .then(async (user) => {

                // Block request if user could not be found or the password is wrong
                if (!user) return done(null, false);
                let isPasswordCorrect = await bcrypt.compare(password, user.password);
                if (!isPasswordCorrect) return done(null, false);

                // Authenticate
                return done(null, user);
            })
            .catch((err) => {
                // Report error if something went wrong
                if (err) return done(err);
            })
    }));
}

module.exports = configure;