angular.module('app.services').factory('$config', [
  function() {
    return {
      "uri": {
        "api": "http://localhost:3000/v1",
        "auth": "http://localhost:3000/auth",
        "web": "http://localhost:3080",
        "admin": "http://localhost:3081",
        "assets": ""
      }
    }
  }
]);
