const express = require('express')
const router = express.Router()
const passport = require('passport')
const jwt = require('jsonwebtoken')
const constants = require('./constants')
const { MongoClient } = require('mongodb')
const bcrypt = require('bcrypt')

/**
 * Configure routes under /auth
 * @param {MongoClient} client
 * @returns express router
 * @prettier
 */
async function configureRoutes(client) {
  let User = await client.db().collection(constants.MONGO_USER_COLLECTION_NAME)

  router.get(
    '/logged-in',
    passport.authenticate('jwt', { session: false }),
    async function (req, res, next) {
      try {
        let user = await User.findOne({ _id: req.user._id });

        user.password = undefined;


        return res.json(user);
      }
      catch (e) {
        return next(e);
      }
    }
  )

  // Login
  router.post(
    '/login',
    passport.authenticate('local', { session: false }),
    function (req, res, next) {
      try {
        let token = jwt.sign({}, constants.JWT_SECRET, {
          expiresIn: constants.JWT_EXP,
          audience: constants.JWT_AUDIENCE,
          subject: req.user._id.toString(),
          issuer: constants.JWT_ISSUER,
        })
        return res.json({ token: token })
      }
      catch (e) {
        return next(e);
      }
    }
  ) // end login

  // User creation
  router.post('/register', async function (req, res) {
    let user = {
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    }
    let errors = []

    // Respond with an error if any of the user properties are missing
    Object.keys(user).forEach(key => {
      if (user[key] != undefined && user[key] != null) return

      errors.push(`${key} is required`)
    }) // end error response

    if (errors.length > 0) {
      res.status(400).send({ errors: errors.join(', ') })
      return
    } // end if

    try {
      let foundUser = await User.find({ username: user.username })
        .limit(1)
        .next()
      if (foundUser != null) {
        // Respond with an error if a user with the supplied username already exists
        res.status(409).send('username already exists')
        return
      } // end if

      user.password = await bcrypt.hash(user.password, 10)

      // Insert user into database
      await User.insertOne(user)
      return res.sendStatus(201)
    } catch (e) {
      // end try
      console.log(e)
      res.sendStatus(500)
    } // end catch
  }); // end user creation

  return router;
} // end route configuration

module.exports = configureRoutes
