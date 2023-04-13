
const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const constants = require('./constants')
const { MongoClient } = require('mongodb')
const bcrypt = require('bcrypt')
const paginationUtils = require('./pagination-utils')

/**
 * Configure routes under /users
 * @param {MongoClient} client
 * @returns express router
 * @prettier
 */
async function configureRoutes(client) {
    let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME);
    let Message = await client.db().collection(constants.MONGO_MESSAGE_COLLECTION_NAME);

    router.get("/", async (req, res) => {
        let [filter, pageNumber, pageSize, sort] = paginationUtils.extractFilterAndPaginationParams(req);

        let users = await User.find(filter).project({ password: 0 }).sort(sort).limit(pageSize).skip(pageNumber * pageSize).toArray();
        let total = await User.countDocuments(filter);

        let maxPage = Math.floor((total / pageSize) - 1);

        if (maxPage < 0) {
            maxPage = 0;
        }

        let results = { results: users, pagination: { currentPage: pageNumber, size: pageSize, total: total, maxPage: maxPage } };

        return res.json(results);
    });

    router.post("/:userId/messages", (req, res) => {
        let receiverId = req.params.userId;
        let content = req.body.content;
        let senderId = req.body.senderId;

    });

    // Get messages between logged-in user and user specified by :userId
    router.get("/:userId/messages", (req, res) => {
        let [filter, pageNumber, pageSize, sort] = paginationUtils.extractFilterAndPaginationParams(req);

        let userId = req.params.userId;
    });

    return router;
}

module.exports = configureRoutes;