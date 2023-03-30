
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const constants = require('./constants');
const { MongoClient } = require('mongodb');

var User = null;

/**
 * Configure routes under /auth
 * @param {MongoClient} client 
 * @returns express router
 */
function configureRoutes(client) {
    User = client.db().collections(constants.MONGO_USER_COLLECTION_NAME);

    // Login
    router.post('/login', passport.authenticate('local'), function (req, res) {
        let token = jwt.sign({}, constants.JWT_SECRET,
            { expiresIn: constants.JWT_EXP, audience: constants.JWT_AUDIENCE, subject: req.user._id });
        return res.json({ token: token });
    });

    // User creation
    router.post('/register', function (req, res) {
        let user = { username: req.body.username, password: req.body.password, firstName: req.body.firstName, lastName: req.body.lastName };

        User.insertOne(user);

        return res.status(201);
    });

    return router;
}

module.exports = configureRoutes;