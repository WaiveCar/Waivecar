'use strict';

let cors = require('koa-cors');

/* istanbul ignore next: its cors man! */

module.exports = (app) => {
  app.use(cors({
    headers : Bento.config.api.cors.headers,
    origin  : (req) => {
      let origin  = req.headers.origin;
      let origins = Bento.config.api.cors.origins;
      if (!origins || origins === '*' || origins.indexOf(origin) !== -1) {
        return origin;
      }
      return null;
    }
  }));
};
