const { MongoClient } = require('mongodb');
const passportJwtConfig = require('./passport-jwt-config');
const passportLocalConfig = require('./passport-local-config');

/**
 * Configure all the passport strategies that can be used to authenticate/authorize requests
 * @param {MongoClient} client 
 */

async function configure(client) {
    await passportJwtConfig(client);
    await passportLocalConfig(client);
} // end passport configuration

module.exports = configure;