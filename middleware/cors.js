'use strict';

let cors = require('koa-cors');

/* istanbul ignore next: its cors man! */

module.exports = function(app) {
  app.use(cors({
    credentials : true,
    headers     : Bento.config.api.cors.headers,
    origin      : function(req) {
      let origin  = req.headers.origin;
      let origins = Bento.config.api.cors.origins;
      let index   = origins.indexOf(origin);
      if (index !== -1) {
        return origins[index];
      }
      return null;
    }
  }));
};
