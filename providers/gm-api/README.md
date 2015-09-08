GM API SERVICE
==============

A service that provides ready to use methods to interact with general motors vehicle APIs

### Config

Remember to place the service configuration into your environment folders, create a new file `gm-api.js`, copy paste the following config, and fill it with the correct information.

```js
module.exports = {

  /*
   |--------------------------------------------------------------------------------
   | General Motors
   |--------------------------------------------------------------------------------
   |
   | Settings for general motors api
   |
   | host    : The api endpoint for the gm api
   | key     : The key used when authenticating requests
   | secret  : The secret used when authenticating request
   | onStart :
   |   testConnection : Invoke the service on app start to test GM connectivity.
   |   initFleet      : Invoke the service on app start to initialize the local cache of cars.
   */

  gm : {
    host : null,
    api  : {
      key    : null,
      secret : null
    },
    onStart : {
      testConnection : true,
      initFleet      : false
    }
  }

};
```