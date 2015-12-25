'use strict';

let newrelic = require('koa-router-newrelic');

module.exports = function(app) {
  app.use(newrelic(app));
};
