$(document).ready(function() {
    $("#submit-button").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();
        var firstName = $("#firstname").val();
        var lastName = $("#lastname").val();

        if (username && password && firstName && lastName) {
            $.ajax({
                type: "POST",
                url: "http://localhost:3000/auth/register",
                data: JSON.stringify({ username: username, password: password, firstName: firstName, lastName: lastName }),
                contentType: "application/json",
                success: function(response) {
                    $.ajax({
                        type: "POST",
                        url: "http://localhost:3000/auth/login",
                        data: JSON.stringify({ username: username, password: password }),
                        contentType: "application/json",
                        success: function(response) {
                            // Store the JWT token in the localStorage
                            localStorage.setItem("token", response.token);

                            // Redirect to the main chat page
                            window.location.href = "../pages/users.html";
                        },
                        error: function(jqXHR, textStatus, errorThrown) {
                            alert("Failed to login. Please try again.");
                            window.location.href = "../pages/login.html";
                        }
                    });
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Registration failed. Please try again.");
                }
            });
        }
    });
    //submit info when enter key is pressed
    $("#firstname, #lastname, #username, #password").on("keyup", function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            var username = $("#username").val();
            var password = $("#password").val();
            var firstName = $("#firstname").val();
            var lastName = $("#lastname").val();

            if (username && password && firstName && lastName) {
                $.ajax({
                    type: "POST",
                    url: "http://localhost:3000/auth/register",
                    data: JSON.stringify({ username: username, password: password, firstName: firstName, lastName: lastName }),
                    contentType: "application/json",
                    success: function(response) {
                        $.ajax({
                            type: "POST",
                            url: "http://localhost:3000/auth/login",
                            data: JSON.stringify({ username: username, password: password }),
                            contentType: "application/json",
                            success: function(response) {
                                // Store the JWT token in the localStorage
                                localStorage.setItem("token", response.token);

                                // Redirect to the main chat page
                                window.location.href = "../pages/users.html";
                            },
                            error: function(jqXHR, textStatus, errorThrown) {
                                alert("Failed to login. Please try again.");
                                window.location.href = "../pages/login.html";
                            }
                        });
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                        alert("Registration failed. Please try again.");
                    }
                });
            }
        }
    });
});
