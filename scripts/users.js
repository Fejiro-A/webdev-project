$(document).ready(function() {
    // Get list of users
    $.ajax({
        type: "POST",
        url: "http://localhost:3000/users/",
        contentType: "application/json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function(res) {
            $.ajax({
                type: "GET",
                url: "http://localhost:3000/auth/logged-in",
                contentType: "application/json",
                beforeSend: function(request) {
                    request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                },
                success: function(result) {
                    addUsers(res.results, result._id);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    addUsers(res.results);
                }
            });
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            alert("Error fetching users. Please try again.");
        }
    });

    // Check if we're logged in
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/auth/logged-in",
        contentType: "application/json",
        beforeSend: function(request) {
            request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
        },
        success: function(res) {
            $("#user-nav").empty();

            var username = document.createElement("li");
            username.id = "user-stats";
            var icon = document.createElement("i");
            icon.classList.add("fa-solid");
            icon.classList.add("fa-user")
            icon.classList.add("profile-icon");
            username.appendChild(icon);
            var usernameLink = document.createElement("a");
            usernameLink.innerText = res.username;
            username.appendChild(usernameLink);

            // Open modal when clicking username
            username.addEventListener("click", function() {
                $("#user-info-modal").attr("open", true);
                $("#user-info-username").text(res.username);
                $("#user-info-id").text(res._id);
                $("#user-info-firstname").text(res.firstName);
                $("#user-info-lastname").text(res.lastName);

                $.ajax({
                    type: "POST",
                    url: "http://localhost:3000/users/stats",
                    contentType: "application/json",
                    beforeSend: function(request) {
                        request.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("token"));
                    },
                    success: function(res) {
                        var today_entries = new Array();
                        const today = new Date();
                        res.forEach(function(entry) {
                            if (entry._id.year == today.getFullYear() && entry._id.month == today.getMonth() + 1 && entry._id.day == today.getDate()) {
                                today_entries.push(entry);
                            }
                        });

                        var activitySum = 0;
                        today_entries.forEach(function(entry) {
                            activitySum += entry.count;
                        });

                        today_entries.forEach(function(entry) {
                            var height = 10 * (entry.count / activitySum);
                            var activityCount = document.createElement("div");
                            activityCount.classList.add("activity-indicator");
                            activityCount.style.height = height + "rem";
                            activityCount.setAttribute("data-tooltip", entry.count + " requests");

                            var hour = document.createElement("div");
                            var start = " ";
                            if (parseInt(entry._id.hour) < 10) {
                                hour.innerText = start + entry._id.hour + ":00";
                            } else {
                                hour.innerText = entry._id.hour + ":00";
                            }
                            hour.classList.add("activity-indicator-hour");
                            activityCount.appendChild(hour);

                            $("#user-stats-grid").append(activityCount);
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                        alert("Error fetching user stats.");
                    }
                });
            });

            var logout = document.createElement("a");
            logout.href = "javascript:;";
            logout.classList.add("secondary");
            logout.id = "logout-button";
            logout.role = "button";
            logout.innerText = "Logout";
            logout.addEventListener("click", function() {
                localStorage.removeItem("token");
                window.location.href = "../pages/login.html";
            });

            $("#user-nav").append(username);
            $("#user-nav").append(logout);
        }
    });

    // Handle closing modal
    $("#user-info-modal-close").click(function() {
        $("#user-info-modal").attr("open", false);
    });
});

// Handle closing modal when clicking off it
$(document).mouseup(function(e) {
    var modal = $("#user-info-modal");
    var visibleModal = $("#user-info-modal-visible");

    if (!visibleModal.is(e.target) && visibleModal.has(e.target).length === 0) {
        modal.attr("open", false);
    }
});
            
//Creates table of users from list
function addUsers(entries, except = null) {
    for (i in entries){
        if (except && except === entries[i]._id) {
            continue;
        }

        let user = document.createElement("tr");
        user.id = entries[i]._id;

        let username = document.createElement("th");
        username.innerText = entries[i].username;
        user.appendChild(username);

        let messages = document.createElement("div");
        messages.classList.add("send");
        let messagesIcon = document.createElement("i");
        messagesIcon.classList.add("fa-solid");
        messagesIcon.classList.add("fa-paper-plane")
        messages.appendChild(messagesIcon);
        messages.setAttribute("data-tooltip", "Message " + entries[i].username);

        user.appendChild(messages);

        $("#user-table").append(user);
    }

    $(".send").each(function() {
        var entry = $(this);
        entry.click(function() {
            window.location.href = "../pages/messages.html?id=" + entry.parent().attr("id");
        });
    });
}


