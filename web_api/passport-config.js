const { MongoClient } = require('mongodb');
const passportJwtConfig = require('./passport-jwt-config');
const passportLocalConfig = require('./passport-local-config');

/**
 * Configure all the passport strategies that can be used to authenticate/authorize requests
 * @param {MongoClient} client 
 */
function configure(client) {
    passportJwtConfig(client);
    passportLocalConfig(client);
}

module.exports = configure;