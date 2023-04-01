const { MongoClient, ObjectId } = require('mongodb');
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const constants = require('./constants');


var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = constants.JWT_SECRET;
opts.issuer = constants.JWT_ISSUER;
opts.audience = constants.JWT_AUDIENCE;

/**
 * Configure passport jwt strategy
 * @param {MongoClient} client 
 */
async function configure(client) {
    let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME);
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        // Look for a user with the id in the jwt payload
        User.find({ _id: new ObjectId(jwt_payload.sub) })
            .limit(1).next()
            .then((user) => {
                // Block request if user could not be found
                if (!user) return done(null, false);

                // Authorize
                return done(null, user);
            }).catch((err) => {
                // Some unexpected error
                if (err) return done(err);
            })
    }));
}

module.exports = configure;