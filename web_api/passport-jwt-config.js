const { MongoClient } = require('mongodb');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const constants = require('./constants');


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = constants.JWT_SECRET;
opts.issuer = constants.JWT_ISSUER;
opts.audience = constants.JWT_AUDIENCE;
var User = null;

/**
 * Configure password jwt strategy
 * @param {MongoClient} client 
 */
function configure(client) {
    User = client.db().collection(constants.MONGO_USER_COLLECTION_NAME);

    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        // Look for a user with the id in the jwt payload
        User.findOne({ _id: jwt_payload.sub }, function (err, user) {
            // Some random error
            if (err) return done(err);

            // Block request if user could not be found
            if (!user) return done(null, false);

            // Authorize
            return done(null, user);
        });
    }));
}

module.exports = configure;