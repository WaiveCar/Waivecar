/*
  Logger Module
  =============
  @author  Christoffer Rødvik
  @license MIT
 */

'use strict';

var co       = require('co');
var ErrorLog = Reach.model('ErrorLog');

// ### Module Setup

module.exports = function *() {
  Reach.Errors.on(logError);
};

/**
 * Logs the error in the database.
 * @method logError
 * @param  {Int}    status
 * @param  {Object} err
 */
function logError(status, err) {
  co(function *() {
    if (500 === status) {
      let error = new ErrorLog({
        id            : err.id,
        errorStatus   : status,
        clientId      : err.from.id,
        clientIp      : err.from.ip,
        detailUri     : err.details.uri,
        detailRoute   : err.details.route,
        detailCode    : err.details.code,
        detailMessage : err.details.message,
        detailData    : JSON.stringify(err.details.data),
        stack         : JSON.stringify(err.stack)
      });
      yield error.save();
    }
  });
}