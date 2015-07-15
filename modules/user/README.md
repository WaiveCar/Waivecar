User Module
===========

Provides [reach-api](https://github.com/reach/api) with user management.

### Dependencies

User module depends on the availability of a `mysql` server

### Routes

This module provides the following routes

```
POST /users          Creates a new user
GET  /users          Lists users
GET  /users/profile  Retrieves authenticated user
GET  /users/:id      Retrieves user by :id
PUT  /users/:id      Updates user by :id
DEL  /users/:id      Deletes user by :id
```