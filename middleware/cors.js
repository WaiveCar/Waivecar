'use strict';

let cors = require('koa-cors');

/* istanbul ignore next: its cors man! */

module.exports = function (app) {
  app.use(cors({
    credentials : true,
    headers     : Reach.config.api.cors.headers,
    origin      : function (req) {
      let origin  = req.headers.origin;
      let origins = Reach.config.api.cors.origins;
      let index   = origins.indexOf(origin);
      if (-1 !== index) {
        return origins[index];
      }
      return null;
    }
  }));
};