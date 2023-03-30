/**
 * This file defines useful app-wide constants
 */
const dotenv = require('dotenv');

dotenv.config();
const projectConstants = {
    MONGODB_URL: process.env.MONGODB_URL,
    MONGO_USER_COLLECTION_NAME: process.env.MONGO_USER_COLLECTION_NAME,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ISSUER: process.env.JWT_ISSUER,
    JWT_AUDIENCE: process.env.JWT_AUDIENCE,
    JWT_EXP: process.env.JWT_EXP
};

module.exports = projectConstants;