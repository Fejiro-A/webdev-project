
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const constants = require('./constants');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

/**
 * Configure routes under /auth
 * @param {MongoClient} client 
 * @returns express router
 */
async function configureRoutes(client) {
    let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME);

    // Login
    router.post('/login', passport.authenticate('local', { session: false }), function (req, res) {
        let token = jwt.sign({}, constants.JWT_SECRET,
            { expiresIn: constants.JWT_EXP, audience: constants.JWT_AUDIENCE, subject: req.user._id.toString(), issuer: constants.JWT_ISSUER });
        return res.json({ token: token });
    });

    // User creation
    router.post('/register', async function (req, res) {

        let user = { username: req.body.username, password: req.body.password, firstName: req.body.firstName, lastName: req.body.lastName };
        let errors = [];

        console.log(user);

        // Respond with an error if any of the user properties are missing
        Object.keys(user).forEach(key => {
            if (user[key] != undefined && user[key] != null) return;

            errors.push(`${key} is required`);
        });

        if (errors.length > 0) {
            res.status(400).send({ errors: errors.join(", ") });
            return;
        }

        try {
            let foundUser = await User.find({ username: user.username }).limit(1).next();
            if (foundUser != null) {
                // Respond with an error if a user with the supplied username already exists
                res.status(409).send("username already exists");
                return;
            }

            user.password = await bcrypt.hash(user.password, 10);

            // Insert user into database
            await User.insertOne(user);
            return res.sendStatus(201);
        }
        catch (e) {
            console.log(e);
            res.sendStatus(500);
        }

    });

    //User retrieval
    router.get('/all-users', async function (req, res) {
        try {
            const users = await User.find().toArray();
            res.json(users);
        } catch (e) {
            console.log(e);
            res.sendStatus(500);
        }
    });

    return router;
}

module.exports = configureRoutes;