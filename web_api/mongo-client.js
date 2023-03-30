/**
 * This file defines a uniform way to get a MongoClient instance connected to a mongodb process
 */
const mongoClient = require('mongodb').MongoClient;
const projectConstants = require('./constants');

global.mongoClient;

const client = await mongoClient.connect(projectConstants.MONGODB_URL, {}, function (err, client) {
    if (err) throw err;

    console.log('Connected to database');
});



module.exports = client;