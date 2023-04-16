var users = [{id:1, username:"sampleUser"},
            {id:2, username:"sampleUser2"},
            {id:3, username:"sampleUser3"}
            ]

$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://localhost:3000/auth/all-users",
        contentType: "application/json",
        success: function(response) {
            addUsers(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
            alert("Error fetching users. Please try again.");
        }
    });
});

            
//Creates table of users from list
function addUsers(entries) {
    for (i in entries){
        var user = document.createElement("tr");

        var userId = document.createElement("th");
        userId.innerText = entries[i]._id;
        user.appendChild(userId);

        var username = document.createElement("td");
        username.innerText = entries[i].username;
        user.appendChild(username);

        $("#user-table").append(user);
    }
}


