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
   | host             : The api endpoint for the gm api
   | key              : The key used when authenticating requests
   | secret           : The secret used when authenticating request
   | initFleetOnStart : ????
   |
   */

  gm : {
    host : null,
    api : {
      key    : null,
      secret : null,
    },
    initFleetOnStart : false
  }

};
```