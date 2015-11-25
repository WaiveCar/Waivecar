'use strict';

let cors = require('koa-cors');

/* istanbul ignore next: its cors man! */

module.exports = (app) => {
  app.use(cors({
    credentials : true,
    headers     : Bento.config.api.cors.headers,
    origin      : (req) => {
      let origin  = req.headers.origin;
      let origins = Bento.config.api.cors.origins;
      
      // ### Wildcard
      
      if (!origins || origins === '*') {
        return origin;
      }
      
      // ### Verify Origin
      
      let index = origins.indexOf(origin);
      if (index !== -1) {
        return origins[index];
      }
      
      return null;
    }
  }));
};
