/**
 * This file defines a uniform way to get a MongoClient instance connected to a mongodb process
 */
const mongoClient = require('mongodb').MongoClient;
const projectConstants = require('./constants');

console.log(`Mongo client: ${projectConstants.MONGODB_URL}`);

async function generateClient() {
    let client = null;
    try {
        client = await mongoClient.connect(projectConstants.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    } catch (e) {
        console.error("Error connecting to MongoDB:", e);
        process.exit(1); // Exit the process if the connection fails
    }

    console.log("Connected to MongoDB");

    return client;
}



module.exports = generateClient;