var users = [{"ID":1, "Username":"sampleUser"},
            {"ID":2, "Username":"sampleUser2"},
            {"ID":3, "Username":"sampleUser3"}
            ]
            
//Creates table of users from list
for (i in users){
    var user = document.createElement("tr");

    var userId = document.createElement("th");
    userId.innerText = users[i]["ID"];
    user.appendChild(userId);

    var username = document.createElement("td");
    username.innerText = users[i]["Username"];
    user.appendChild(username);

    $("#user-table").appendChild(user);
    
}
