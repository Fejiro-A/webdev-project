# API Guide

**Note**: All endpoints expect the request body to be in JSON format. This means that every request needs the "Content-Type" attribute in the header set to "application/json".  

```<MongoQuery>``` Look at examples of a query syntax [here](https://www.javatpoint.com/mongodb-find-method#:~:text=In%20mongoDB%2C%20the%20find(),events%20to%20the%20selected%20data.)


```<MongoSort>``` Look at examples of a sort syntax [here](https://www.geeksforgeeks.org/mongodb-sort-method/)


## POST /auth/register
Registers new users.  
<ul>

### Body

<ul>

**Format:**
```json
{  
    "username": text,  
    "password": text,  
    "firstName": text,  
    "lastName": text  
}
```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with created user JSON  
**Status Code:** 201  
**Body Format:**
```json
{  
    "_id": text,
    "username": text,   
    "firstName": text,  
    "lastName": text  
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## POST /auth/login
Login to get a token  
<ul>

### Body

<ul>

**Format:**
```json
{  
    "username": text,  
    "password": text
}
```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with a JWT  
**Status Code:** 200  
**Body Format:**
```json
{  
    "token": text
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## GET /auth/logged-in
Get logged-in user details from JWT in "Authorization" attribute of header.
<ul>

### Header

<ul>

<li>

Authorization: Bearer ```<JWT>```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with user JSON  
**Status Code:** 200  
**Body Format:**
```json
{  
    "_id": text,
    "username": text,   
    "firstName": text,  
    "lastName": text  
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## GET /users
Get list of users 
<ul>

### Header

<ul>

<li>

Authorization: Bearer ```<JWT>```

</ul>

### Body

<ul>

**Format:**
```json
{  
    "pagination": {
        "pageNo": int (optional),
        "pageSize": int (optional),
        "sort": {
            <MongoSort>
        } (optional)
    } (optional),
    "filter": {
        <MongoQuery>
    } (optional)
}
```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with a page of user objects  
**Status Code:** 200  
**Body Format:**
```json
{ 
    "results": list of users,
    "pagination": { 
        "currentPage": int (current page number),
        "size": int (size of the current page),
        "total": int (total number of users that match request criteria in the DB),
        "maxPage": int (maximum page number)
    }
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## GET /users/***:userId***
Get user details under id ***:userId***
<ul>

### Header

<ul>

<li>

Authorization: Bearer ```<JWT>```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with user JSON  
**Status Code:** 200  
**Body Format:**
```json
{  
    "_id": text,
    "username": text,   
    "firstName": text,  
    "lastName": text  
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## POST /users/***:userId***/messages
Send message from logged-in user to user under id ***:userId***
<ul>

### Header

<ul>

<li>

Authorization: Bearer ```<JWT>```

</ul>

### Body

<ul>

**Format:**
```json
{  
    "content": text
}
```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with a page of message objects  
**Status Code:** 200  
**Body Format:**
```json
{ 
    "_id": text,
    "receiverId": text,
    "content": text,
    "senderId": text,
    "creationDate": int (date as milliseconds since epoch),
    "read": bool
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## GET /users/***:userId***/messages
Get list of messages between logged-in user and user under id ***:userId***
<ul>

### Header

<ul>

<li>

Authorization: Bearer ```<JWT>```

</ul>

### Body

<ul>

**Format:**
```json
{  
    "pagination": {
        "pageNo": int (optional),
        "pageSize": int (optional),
        "sort": {
            <MongoSort>
        } (optional)
    } (optional),
    "filter": {
        <MongoQuery>
    } (optional)
}
```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with a page of message objects  
**Status Code:** 200  
**Body Format:**
```json
{ 
    "results": list of message objects,
    "pagination": { 
        "currentPage": int (current page number),
        "size": int (size of the current page),
        "total": int (total number of messages that match request criteria in the DB),
        "maxPage": int (maximum page number)
    }
}
```

<li>

#### On Failure
**Status Code:** 500 


</ul>

</ul>

## GET /users/stats
Get activity stats of logged in user  
<ul>

### Header

<ul>

<li>

Authorization: Bearer ```<JWT>```

</ul>

### Body

<ul>

**Format:**
```json
{  
    "group": text (default: "hour", possible values: "year", "month", "week", "day", "hour", "minute"),
    "earliest": date,
    "latest": date
}
```

</ul>

### Response

<ul>

<li>

#### On Success
Responds with a list of stats divided by the specified group
**Status Code:** 200  
**Body Format:**
```json
[
    {
        "_id": {
            "year": int,
            "month": int (optional),
            "week": int (optional),
            "day": int (optional),
            "hour": int (optional),
            "minute": int (optional)
        },
        "date": date,
        "count": int (number of requests sent in the group)
    }
    ...
]
```

<li>

#### On Failure
**Status Code:** 500 


</ul>
</ul>



# Websocket Guide

Every message to and from the websocket should be a JSON string.  

Every message has a label property.  

To connect with the websocket, use the **/chat** path

## label: "auth"

<ul>

After a successful connection to the websocket,
you have to send a message in the following format to authenticate the user:
```json
{
    "label": "auth",
    "token": <JWT>
}
```

Sending this message once per connection is sufficient

</ul>

## label: "chat"

<ul>

When a user adds a new message using the (POST /users/***:userId***/messages) API endpoint, the server will automatically attempt to send the message to the receipient user.  
The message will be in the following format:
```json
{
    "label": "chat",
    "message": {
        "_id": text,
        "receiverId": text,
        "content": text,
        "senderId": text,
        "creationDate": int (date as milliseconds since epoch,
        "read": bool
    }
}
```

</ul>
