$(document).ready(function() {
    $("#submit-button").click(function() {
        var username = $("#username").val();
        var password = $("#password").val();

        if (username && password) {
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
                    alert("Login failed. Check your credentials.");
                }
            });
        }
    });
    //submit info when enter key is pressed
    $("#password,#username").on("keyup", function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            var username = $("#username").val();
            var password = $("#password").val();
            if (username && password) {
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
                        alert("Login failed. Check your credentials.");
                    }
                });
            }
        }
    });
});
