/**
  Error Handler
  =============
  @author  Christoffer Rødvik (C) 2015
  @license MIT
 */

'use strict';

// ### Middleware

module.exports = function (app) {
  app.use(Reach.ErrorHandler());
};