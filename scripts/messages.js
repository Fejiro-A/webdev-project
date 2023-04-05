// Contains the username that the user is currently logged in as
var username = "";

// On document load
$(document).ready(function() {
    $("#message-send").click(function() {
        if ($("#message-input").val() && username) {
            // Add message to screen
            addMessage(username, $("#message-input").val());
        }
    });
});

/**
 * Update the username that we are currently logged in as.
 * To be called on page load after logging in.
 * @param  {String} user The new username
 */
function setUser(user) {
    // Update username variable
    username = user;

    // Update username display
    $("#username").text("Logged in as " + user);
}

/**
 * Add a message to the screen.
 * To be called when there is a new message available from the server.
 * @param  {String} sender The username that sent the message
 * @param  {String} contents The message that was sent
 */
function addMessage(sender, contents) {
    var message = document.createElement("div");
    message.classList.add("message");

    var messageText = document.createElement("div");
    messageText.classList.add("message-text");
    messageText.innerText = contents;
    message.appendChild(messageText);

    var messageSender = document.createElement("div");
    messageSender.classList.add("message-sender");
    messageSender.innerText = sender;
    message.appendChild(messageSender);

    // If the user sent this message, add "self" class
    if (sender == username) {
        message.classList.add("self");
    }

    // Add message to chat window
    $("#chat-box").append(message);

    // Move dummy end to end of messages
    updateDummyEnd();

    // Scroll to bottom of container
    $(".chat-container").scrollTop($(".chat-container").prop("scrollHeight"));
}

function updateDummyEnd() {
    // Delete dummy end
    $(".dummy-end").remove();

    // Create new dummy end
    var dummyEnd = document.createElement("div");
    dummyEnd.classList.add("dummy-end");
    dummyEnd.innerText = "End of messages.";

    // Add dummy end to end of messages
    $("#chat-box").append(dummyEnd);
}