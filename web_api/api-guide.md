# API Guide

**Note**: All endpoints expect the request body to be in JSON format. This means that every request needs the "Content-Type" attribute in the header set to "application/json".
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
        <MongoFilter>
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
        <MongoFilter>
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

