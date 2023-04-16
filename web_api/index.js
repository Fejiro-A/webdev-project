const express = require('express')
const app = express()
const expressWs = require('express-ws')(app)
const passportConfig = require('./passport-config')
const generateMongoClient = require('./mongo-client')
const bodyParser = require('body-parser')
const passport = require('passport')
const authRoute = require('./auth')
const userRoute = require('./users')
const { setupChatWebsockets } = require('./chat')

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

    let webSocketConnections = setupChatWebsockets(expressWs);

    // Configure routes
    app.use('/auth', await authRoute(mongoClient))
    app.use('/users', passport.authenticate('jwt', { session: false }), await userRoute(mongoClient, webSocketConnections))

    app.use((error, req, res, next) => {
        console.error(error.stack);
        res.status(500).send("Something went wrong");
    })

    // end authentication



    // Start listening for requests
    app.listen(port, () => {
        console.log(`Started server; Listening at port ${port}`)
    }) // end request listen
} // end server initialization

beginServer()
