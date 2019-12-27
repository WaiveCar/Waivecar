'use strict';

let cors = require('koa-cors');

module.exports = app => {
  app.use(
    cors({
      allowHeaders: Bento.config.api.cors.headers,
      credentials : true,
      origin: req => {
        let origin = req.headers.origin;
        let origins = Bento.config.api.cors.origins;
        console.log('origin', origin);
        console.log('origins', origins);
        if (!origins || origins === '*' || origins.indexOf(origin) !== -1) {
          return origin;
        }
        return null;
      },
    }),
  );
};
