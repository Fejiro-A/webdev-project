const { Instance } = require('express-ws');
const { ObjectId } = require('mongodb');
const { WebSocket } = require('ws');
const jwt = require('jsonwebtoken')
const constants = require('./constants')

/**
 * Handle auth messages that help us keep track of user identities
 * @param {Object} message 
 * @param {Map} webSocketConnections 
 * @param {WebSocket} ws 
 */
function handleAuthMessage(message, webSocketConnections, ws) {
    try {
        let payload = jwt.verify(message.token, constants.JWT_SECRET, { issuer: constants.JWT_ISSUER, audience: constants.JWT_AUDIENCE });
        let userId = payload.sub;
        webSocketConnections.set(userId, ws);
    } catch (e) {
        console.log(e);
        let errorJson = { label: "auth-failed", error: e };
        ws.send(JSON.stringify(errorJson));
    }
}

/**
 * Remove websocket connection from map of websocket connections
 * @param {Map} webSocketConnections 
 * @param {WebSocket} ws 
 */
function removeWsConnection(webSocketConnections, ws) {
    let entries = [...webSocketConnections.entries()];
    entries.filter((entry) => entry[1] == ws).forEach((entry) => webSocketConnections.delete(entry[0]));
}

/**
 * Handle json websocket messages
 * @param {Object} message 
 * @param {Map} webSocketConnections 
 * @param {WebSocket} ws 
 */
function handleMessage(message, webSocketConnections, ws) {
    if (message.label == "auth") {
        handleAuthMessage(message, webSocketConnections, ws);
    } else if (message.label == "close") {
        removeWsConnection(webSocketConnections, ws);
        ws.close(1000);
    }
}

/**
 * Attempt to send chat message to a user
 * @param {Object} message 
 * @param {Map<string, WebSocket>} webSocketConnections 
 */
function sendChatMessage(message, webSocketConnections) {
    try {
        let ws = webSocketConnections.get(message.receiverId.toString());

        if (ws == undefined || ws == null) return;
        let webSocketMessage = { label: "chat", message: message };
        ws.send(JSON.stringify(webSocketMessage));
    } catch (e) {
        console.log(e);
    }
}

/**
 * Setup websocket server to facilitate realtime messaging between users
 * @param {Instance} wsExpressInstance 
 * @returns 
 */
function setupChatWebsockets(wsExpressInstance) {
    var webSocketConnections = new Map();

    wsExpressInstance.app.ws('/chat', (ws, req) => {
        ws.on('message', (msg) => {
            try {
                let json = JSON.parse(msg);
                handleMessage(json, webSocketConnections, ws);
            } catch (e) {
                console.log(e);
            }
        });

        ws.on('close', (code, reason) => {
            try {
                removeWsConnection(webSocketConnections, ws);
            } catch (e) {
                console.log(e);
            }
        });

    });

    return webSocketConnections;
}

module.exports = {
    setupChatWebsockets: setupChatWebsockets,
    sendChatMessage: sendChatMessage
}