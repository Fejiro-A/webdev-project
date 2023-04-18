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
                    // Redirect to the login page
                    window.location.href = "../pages/messages.html";
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    alert("Registration failed. Please try again.");
                }
            });
        }
    });
});
