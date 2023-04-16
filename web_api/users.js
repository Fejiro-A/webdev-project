
const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const constants = require('./constants')
const { MongoClient, ObjectId } = require('mongodb')
const bcrypt = require('bcrypt')
const paginationUtils = require('./pagination-utils')
const { sendChatMessage } = require('./chat')


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

function getAggregateArgsBasedOnGroup(divider, earliest, latest, userId) {
    if (divider == "year") {
        return [
            { $match: { date: { $gte: earliest, $lte: latest }, userId: userId } },
            {
                $project: {
                    "y": { "$year": "$date" },
                    "date": 1
                }
            },
            {
                $group: {
                    "_id": { "year": "$y" },
                    "date": { $first: "$date" },
                    'count': { $sum: 1 }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ];
    }
    else if (divider == "month") {
        return [
            { $match: { date: { $gte: earliest, $lte: latest }, userId: userId } },

            {
                $project: {
                    "y": { "$year": "$date" },
                    "m": { "$month": "$date" },
                    "date": 1
                }
            },
            {
                "$group": {
                    "_id": { "year": "$y", "month": "$m" },
                    "date": { $first: "$date" },
                    'count': { $sum: 1 }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ];
    }
    else if (divider == "week") {
        return [
            { $match: { date: { $gte: earliest, $lte: latest }, userId: userId } },

            {
                $project: {
                    "y": { "$year": "$date" },
                    "m": { "$month": "$date" },
                    "w": { "$week": "$date" },
                    "date": 1
                }
            },
            {
                "$group": {
                    "_id": { "year": "$y", "month": "$m", "week": "$w" },
                    "date": { $first: "$date" },
                    'count': { $sum: 1 }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ];
    }
    else if (divider == "day") {
        return [
            { $match: { date: { $gte: earliest, $lte: latest }, userId: userId } },
            {
                "$project": {
                    "y": { "$year": "$date" },
                    "m": { "$month": "$date" },
                    "d": { "$dayOfMonth": "$date" },
                    "date": 1
                }
            },
            {
                "$group": {
                    "_id": { "year": "$y", "month": "$m", "day": "$d" },
                    "date": { $first: "$date" },
                    'count': { $sum: 1 }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ];
    }
    else if (divider == "hour") {
        return [
            { $match: { date: { $gte: earliest, $lte: latest }, userId: userId } },
            {
                "$project": {
                    "y": { "$year": "$date" },
                    "m": { "$month": "$date" },
                    "d": { "$dayOfMonth": "$date" },
                    "h": { "$hour": "$date" },
                    "date": 1
                }
            },
            {
                "$group": {
                    "_id": { "year": "$y", "month": "$m", "day": "$d", "hour": "$h" },
                    "date": { $first: "$date" },
                    'count': { $sum: 1 }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ];
    }
    else if (divider == "minute") {
        return [
            {
                $match: {
                    date: { $gte: earliest, $lte: latest },
                    userId: userId
                }
            },
            {
                $project: {
                    "y": { "$year": "$date" },
                    "m": { "$month": "$date" },
                    "d": { "$dayOfMonth": "$date" },
                    "h": { "$hour": "$date" },
                    "min": { "$minute": "$date" },
                    "date": 1
                }
            },
            {
                $group: {
                    "_id": { "year": "$y", "month": "$m", "day": "$d", "hour": "$h", "minute": "$min" },
                    "date": { $first: "$date" },
                    'count': { $sum: 1 }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ];
    }
}

/**
 * Configure routes under /users
 * @param {MongoClient} client
 * @param {Map<string, WebSocket>} webSocketConnections
 * @returns express router
 * @prettier
 */
async function configureRoutes(client, webSocketConnections) {
    let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME);
    let Message = await client.db().collection(constants.MONGO_MESSAGE_COLLECTION_NAME);
    let Request = await client.db().collection(constants.MONGO_REQUEST_COLLECTION_NAME);

    // Get a list of users
    router.get("/", async (req, res, next) => {
        try {
            let [filter, pageNumber, pageSize, sort] = paginationUtils.extractFilterAndPaginationParams(req);

            if (filter.hasOwnProperty("_id")) {
                filter["_id"] = new ObjectId(filter["_id"]);
            }

            let users = await User.find(filter).project({ password: 0 }).sort(sort).limit(pageSize).skip(pageNumber * pageSize).toArray();
            if (!users) {
                return res.status(404).json({ "error": "Users not found" })
            }
            let total = await User.countDocuments(filter);
            if (!total) {
                return res.status(404).json({ "error": "Finding count of users failed" })
            }

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

    router.get("/stats", async (req, res, next) => {
        try {
            let userId = req.user._id;
            let earliest = req.body.earliest;
            let latest = req.body.latest;
            let group = req.body.group;

            if (!group) {
                group = "hour";
            }

            if (!earliest) {
                earliest = "2023-01-01";
            }

            if (!latest) {
                latest = new Date();
            }

            earliest = new Date(earliest);
            latest = new Date(latest);

            // console.log(earliest);
            // console.log(latest);
            // console.log(group);

            let stats = await Request.aggregate(getAggregateArgsBasedOnGroup(group, earliest,
                latest, userId)).toArray();

            // console.log(stats);

            return res.json(stats);
        } catch (e) {
            console.log(e);
            return next(e);
        }
    });

    // Get specific user info associated with id :userId
    router.get("/:userId", async (req, res) => {

        try {
            let user = await User.findOne({ _id: new ObjectId(req.params.userId) });
            if (!user) {
                return res.status(404).json({ "error": "User not found" })
            }

            user.password = undefined;

            return res.json(user);
        }
        catch (e) {
            return res.sendStatus(500);
        }
    });

    // send message from logged-in user to the user associated with id :userId
    router.post("/:userId/messages", async (req, res, next) => {

        try {
            if (!req.body.content) {
                return res.status(400).json({ "error": "Request body must contain content" })
            }
            if (!req.user) {
                return res.status(404).json({ "error": "Could not find inserted object" })
            }
            let receiverId = new ObjectId(req.params.userId);
            let content = req.body.content;
            let senderId = new ObjectId(req.user._id);
            let date = Date.now();

            let messageObject = { receiverId: receiverId, content: content, senderId: senderId, creationDate: date, read: false };


            let insertionResult = await (await Message.insertOne(messageObject));

            let newlyInsertedObject = await Message.findOne({ _id: insertionResult.insertedId });


            if (newlyInsertedObject == null) {
                return res.status(400).json({ "error": "Could not find inserted object" });
            }

            sendChatMessage(newlyInsertedObject, webSocketConnections);
            // newlyInsertedObject = addStringDateToMessage(newlyInsertedObject);

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

            if (!req.user) {
                return res.status(404).json({ "error": "Could not find inserted object" })
            }

            let otherUserId = new ObjectId(req.params.userId);
            let loggedInUserId = new ObjectId(req.user._id);
            filter = { ...filter, $or: [{ senderId: otherUserId, receiverId: loggedInUserId }, { senderId: loggedInUserId, receiverId: otherUserId }] };
            let messages = await Message.find(filter)
                .sort(sort).limit(pageSize).skip(pageNumber * pageSize).toArray();
            // messages = messages.map(addStringDateToMessage);
            if (!messages) {
                return res.status(404).json({ "error": "Messages not found" })
            }
            messages = messages.map(addStringDateToMessage);

            let total = await User.countDocuments(filter);
            if (!total) {
                return res.status(404).json({ "error": "Finding count of messages failed" })
            }

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