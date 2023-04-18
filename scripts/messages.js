// Contains the username that the user is currently logged in as
var username = "";

// Contains the username that we are messaging
var receiver = "";
var receiver_id = "";

// Websocket for receiving new messages
const socket = new WebSocket("ws://localhost:3000/chat");

// Send auth when websocket opens
socket.addEventListener("open", (event) => {
    socket.send(JSON.stringify({
        "label": "auth",
        "token": localStorage.getItem("token")
    }));
});

// Listen for messages from websocket
socket.addEventListener("message", (event) => {
    // Get user that we are chatting with
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const receiverId = urlParams.get("id");

    $.ajax({
        type: "GET",
        url: "http://localhost:3000/users/" + receiverId + "/messages",
        contentType: "application/json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function(res) {
            updateMessages(res.results);
        },
        error: function(hqXHR, textStatus, errorThrown) {
            console.log(hqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            alert("Could not retrieve messages.");
        }
    });
})

// On document load
$(document).ready(function() {
    // Send message when user hits send button
    $("#message-send").click(function() {
        if ($("#message-input").val() && username && receiver_id) {
            // Send message to receiver
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/users/" + receiver_id + "/messages",
                contentType: "application/json",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
                data: JSON.stringify({content: $("#message-input").val()}),
                success: function(response) {
                    // Update messages after sending
                    $.ajax({
                        type: "GET",
                        url: "http://localhost:3000/users/" + receiverId + "/messages",
                        contentType: "application/json",
                        beforeSend: function(request) {
                            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                        },
                        success: function(res) {
                            $("#message-input").val('');
                            updateMessages(res.results);
                        },
                        error: function(hqXHR, textStatus, errorThrown) {
                            console.log(hqXHR);
                            console.log(textStatus);
                            console.log(errorThrown);
                            alert("Could not retrieve messages.");
                        }
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Could not send message.");
                }
            })
        }
    });
    
    // Send message when user hits "enter" while in text field
    $("#message-input").on("keyup", function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            if ($("#message-input").val() && username && receiver_id) {
                // Send message to receiver
                $.ajax({
                    type: "POST",
                    url: "http://localhost:3000/users/" + receiver_id + "/messages",
                    contentType: "application/json",
                    beforeSend: function(request) {
                        request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                    },
                    data: JSON.stringify({content: $("#message-input").val()}),
                    success: function(response) {
                        // Update messages after sending
                        $.ajax({
                            type: "GET",
                            url: "http://localhost:3000/users/" + receiverId + "/messages",
                            contentType: "application/json",
                            beforeSend: function(request) {
                                request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                            },
                            success: function(res) {
                                $("#message-input").val('');
                                updateMessages(res.results);
                            },
                            error: function(hqXHR, textStatus, errorThrown) {
                                console.log(hqXHR);
                                console.log(textStatus);
                                console.log(errorThrown);
                                alert("Could not retrieve messages.");
                            }
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert("Could not send message.");
                    }
                })
            }
        }
    });

    // Logout button
    $("#logout-button").click(function() {
        localStorage.removeItem("token");
        window.location.href = "../pages/login.html";
    });

    // Set user that we are chatting with
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const receiverId = urlParams.get("id");
    receiver_id = receiverId;
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/users/" + receiverId,
        contentType: "application/json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function(res) {
            setReceiver(res.username);
        },
        error: function(hqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });

    // Set our user
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/auth/logged-in",
        contentType: "application/json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function(res) {
            setUser(res.username);
        },
        error: function(hqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    });
    
    // Get all messages between user and receiver
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/users/" + receiverId + "/messages",
        contentType: "application/json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function(res) {
            updateMessages(res.results);
        },
        error: function(hqXHR, textStatus, errorThrown) {
            console.log(hqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            alert("Could not retrieve messages.");
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
 * Update the user that we are currently messaging.
 * To be called on page load after logging in.
 * @param  {String} user The new username
 */
function setReceiver(user) {
    // Update username variable
    receiver = user;

    // Update username display
    $("#receiver").text("Chat with " + user);
}

function updateMessages(messages) {
    $(".message").remove();

    var sorted = [...messages];
    sorted = sorted.sort((a, b) => Date.parse(b.creationDate) - Date.parse(a.creationDate)).reverse();
    var promises = [];
    for (let message of sorted) {
        // Get message sender username
        promises.push($.ajax({
            type: "GET",
            url: "http://localhost:3000/users/" + message.senderId,
            contentType: "application/json",
            beforeSend: function(request) {
                request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
            },
            success: function(res) {
                message["senderUsername"] = res.username;
            },
            error: function(hqXHR, textStatus, errorThrown) {
                message["senderUsername"] = "";
            }
        }));
    }

    Promise.all(promises)
    .then(responseList => {
        for (let message of sorted) {
            addMessage(message.senderUsername, message.content);
        }
    });
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

