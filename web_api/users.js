
const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const constants = require('./constants')
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const paginationUtils = require('./pagination-utils')

/**
 * Add full sender and receiver objects to message
 * @param {*} messageObj 
 * @param {*} userObjs 
 * @returns 
 */
async function addUserObjsToMessageObj(messageObj, userObjs) {
    return { ...messageObj, sender: userObjs[messageObj.senderId], receiver: userObjs[messageObj.receiverId] };
}

function addStringDateToMessage(messageObj) {
    let newMessage = { ...messageObj };
    newMessage.creationDate = new Date(newMessage.creationDate).toUTCString();

    return newMessage;
}

/**
 * Configure routes under /users
 * @param {MongoClient} client
 * @returns express router
 * @prettier
 */
async function configureRoutes(client) {
    let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME);
    let Message = await client.db().collection(constants.MONGO_MESSAGE_COLLECTION_NAME);

    // Get a list of users
    router.get("/", async (req, res, next) => {
        try {
            let [filter, pageNumber, pageSize, sort] = paginationUtils.extractFilterAndPaginationParams(req);

            if (filter.hasOwnProperty("_id")) {
                filter["_id"] = new ObjectId(filter["_id"]);
            }

            let users = await User.find(filter).project({ password: 0 }).sort(sort).limit(pageSize).skip(pageNumber * pageSize).toArray();
            let total = await User.countDocuments(filter);

            let maxPage = Math.floor((total / pageSize) - 1);

            if (maxPage < 0) {
                maxPage = 0;
            }

            let results = { results: users, pagination: { currentPage: pageNumber, size: pageSize, total: total, maxPage: maxPage } };

            return res.json(results);
        } catch (e) {
            return next(e);
        }
    });

    // Get specific user info associated with id :userId
    router.get("/:userId", async (req, res) => {

        try {
            let user = await User.findOne({ _id: new ObjectId(req.params.userId) });

            return res.json(user);
        }
        catch (e) {
            return res.sendStatus(500);
        }
    });

    // Get messages between logged-in user and the user associated with id :userId
    router.post("/:userId/messages", async (req, res, next) => {

        try {
            let receiverId = new ObjectId(req.params.userId);
            let content = req.body.content;
            let senderId = new ObjectId(req.user._id);
            let date = Date.now();

            let messageObject = { receiverId: receiverId, content: content, senderId: senderId, creationDate: date, read: false };


            let insertionResult = await Message.insertOne(messageObject);

            let newlyInsertedObject = await Message.findOne({ _id: insertionResult.insertedId });

            if (newlyInsertedObject == null) {
                return res.status(500).send("Could not find inserted object");
            }
            newlyInsertedObject = addStringDateToMessage(newlyInsertedObject);

            return res.json(newlyInsertedObject);
        }
        catch (e) {
            return next(e);
        }
    });

    // Get messages between logged-in user and user specified by :userId
    router.get("/:userId/messages", async (req, res, next) => {
        try {
            let [filter, pageNumber, pageSize, sort] = paginationUtils.extractFilterAndPaginationParams(req);

            let otherUserId = new ObjectId(req.params.userId);
            let loggedInUserId = new ObjectId(req.user._id);
            filter = { ...filter, $or: [{ senderId: otherUserId, receiverId: loggedInUserId }, { senderId: loggedInUserId, receiverId: otherUserId }] };
            console.log(filter);
            let messages = await Message.find(filter)
                .sort(sort).limit(pageSize).skip(pageNumber * pageSize).toArray();
            messages = messages.map(addStringDateToMessage);

            let total = await User.countDocuments(filter);

            let maxPage = Math.floor((total / pageSize) - 1);

            if (maxPage < 0) {
                maxPage = 0;
            }

            let results = { results: messages, pagination: { currentPage: pageNumber, size: pageSize, total: total, maxPage: maxPage } };

            return res.json(results);
        }
        catch (e) {
            return next(e);
        }
    });

    return router;
}

module.exports = configureRoutes;