const express = require('express');
const app = express();
const passportConfig = require('./passport-config');
const mongoClient = require('./mongo-client');
const bodyParser = require('body-parser');
const passport = require('passport');
const authRoute = require('./auth');


const port = 3000;

// Middleware to put contents of raw request body into req.body
app.use(bodyParser.json());

// Configure passport strategies
passportConfig(mongoClient);

app.use(passport.initialize());

// Configure routes
app.use('/auth', authRoute(mongoClient));

// Start listening for requests
app.listen(port, () => {
    console.log(`Started server; Listening at port ${port}`);
})