'use strict';

let cors = require('koa-cors');

module.exports = app => {
  app.use(
    cors({
      origin: (req) => {
        let origin = req.headers.origin;
        let origins = Bento.config.api.cors.origins;
        if (!origins || origins === '*' || origins.indexOf(origin) !== -1) {
          return origin;
        }
        return null;
      },
    }),
  );
};
