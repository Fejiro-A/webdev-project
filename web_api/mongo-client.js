/**
 * This file defines a uniform way to get a MongoClient instance connected to a mongodb process
 * @prettier
 */

const mongoClient = require('mongodb').MongoClient
const projectConstants = require('./constants')

console.log(`Mongo client: ${projectConstants.MONGODB_URL}`)

async function generateClient() {
  let client = null
  try {
    client = await mongoClient.connect(projectConstants.MONGODB_URL)
  } catch (e) {
    // end try
    console.log(e)
  } // end catch

  console.log('Connected to mongo db')

  return client
} // end client generation

module.exports = generateClient
