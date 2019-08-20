'use strict';

let cors = require('koa-cors');

/* istanbul ignore next: its cors man! */

module.exports = (app) => {
  app.use(cors());
};
