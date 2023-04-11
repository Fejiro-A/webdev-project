var users = [{id:1, username:"sampleUser"},
            {id:2, username:"sampleUser2"},
            {id:3, username:"sampleUser3"}
            ]

$(document).ready(function() {
    addUsers(users);
});
            
//Creates table of users from list
function addUsers(entries) {
    for (i in entries){
        var user = document.createElement("tr");
    
        var userId = document.createElement("th");
        userId.innerText = users[i].id;
        user.appendChild(userId);
    
        var username = document.createElement("td");
        username.innerText = users[i].username;
        user.appendChild(username);
    
        $("#user-table").append(user);
    }
}

