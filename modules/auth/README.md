User Module
===========

Provides [reach-api](https://github.com/reach/api) with user authentication features

### Dependencies

User module depends on the availability of a `redis` server

### Routes

This module provides the following routes

```
POST /login          Creates an authentication token and attaches it to the verified user
GET  /remember       Extends the authentication token by 1 year
GET  /logout         Removes the authentication token
```