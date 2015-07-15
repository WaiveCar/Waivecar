'use strict';

let event    = Reach.Event;
let ErrorLog = Reach.model('ErrorLog');

/**
 * Logs the error in the database.
 * @method logError
 * @param  {Object} err
 */
event.on('error:500', function *(err) {
  let error = new ErrorLog({
    id            : err.id,
    errorStatus   : 500,
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
});