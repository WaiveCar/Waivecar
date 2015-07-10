/**
  CORS
  ====

  CORS middleware with total adjustability from Reach.config found in api/config/default.js

  @author  Christoffer Rødvik (C) 2015
  @license MIT
 */

'use strict';

// ### Dependencies

var cors = require('koa-cors');

// ### Middleware

module.exports = function (app) {
  app.use(cors({
    credentials : true,
    headers     : Reach.config.api.cors.headers,
    origin      : function (req) {
      var origin  = req.headers.origin;
      var origins = Reach.config.api.cors.origins;
      var index   = origins.indexOf(origin);
      if (-1 !== index) {
        return origins[index];
      }
      return null;
    }
  }));
};