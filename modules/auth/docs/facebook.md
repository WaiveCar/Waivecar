# Facebook

 - [Introduction](#introduction)
 - [Requests](#requests)
 - [Register](#register)
 - [Connect](#connect)
 - [Login](#login)

## [Introduction](#introduction)

Facebook operations against the auth module is designed in a way that makes it very much up to the front end implementation on how to handle certain scenarios. The API module is split up into 3 logic areas, `registration`, `connect`, and `login`.

Each subject will be covered in this documentation file.

## [Requests](#requests)

All facebook operations uses the same request endpoint and payload. To make a new request you will need to provide the API with a facebook access `token`, and the fields that the token has access to. All the fields in the request payload are required on each type:

```
POST /auth/facebook
{
  type   : 'register|connect|login',
  token  : ...,
  fields : ...
}
```

## [Register](#register)

To register a new user via facebook set the payload request type to `register`.

#### 200 Responses

A successfull registration response contains the registered user object along with an authenticated token.

#### 400 Responses

 - **FB_ID_EXISTS** means the facebook account has already been connected to an account in the API, at this point as the front end you decide what the appropriate response is. If you wish to simply sign the user in then make another FB request against your facebook login logic. At this point it should be very quick since the user has already granted access to your app.

 - **FB_EMAIL_EXISTS** means that the facebook account email already exists in the system (but has not been connected). At this point you might want to tell the user to log in and perform a facebook connect request. How this is handled is completely up to the front end service.

## [Connect](#connect)

To connect a user via facebook set the payload request type to `connect`, and assign the authenticated session token to the `Authorization` header key.

## [Login](#login)

To login a user via facebook set the payload request type to `login`.
