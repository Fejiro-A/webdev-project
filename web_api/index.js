const express = require('express')
const app = express()
const passportConfig = require('./passport-config')
const generateMongoClient = require('./mongo-client')
const bodyParser = require('body-parser')
const passport = require('passport')
const authRoute = require('./auth')

/**
 * @prettier
 */

async function beginServer() {
  const port = 3000
  let mongoClient = await generateMongoClient()
  // Middleware to put contents of raw request body into req.body
  app.use(bodyParser.json())

  // Configure passport strategies
  await passportConfig(mongoClient)

  app.use(passport.initialize())

  // Configure routes
  app.use('/auth', await authRoute(mongoClient))

  app.get(
    '/auth-test',
    passport.authenticate('jwt', { session: false }),
    function (req, res) {
      res.send(`Hello ${req.user.username}`)
    }
  ) // end authentication

  // Start listening for requests
  app.listen(port, () => {
    console.log(`Started server; Listening at port ${port}`)
  }) // end request listen
} // end server initialization

beginServer()
