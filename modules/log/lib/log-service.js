'use strict';

let shortid     = require('shortid');
let moment      = require('moment');
let queryParser = Bento.provider('sequelize/helpers').query;
let ErrorLog    = Bento.model('ErrorLog');
let EventLog    = Bento.model('EventLog');
let hooks       = Bento.Hooks;
let error       = Bento.Error;
let logs        = Bento.Log;

module.exports = class LogService {

  /**
   * Stores a new log record.
   * @param  {String} type
   * @param  {Object} payload
   * @return {Object}
   */
  static *create(type, payload) {
    switch (type) {
      case 'error' : return yield this.error(payload);
      case 'event' : return yield this.event(payload);
    }
  }

  /**
   * Logs a new error event with the database.
   * @param  {Object} payload
   * @return {Object}
   */
  static *error(payload) {
    let log = yield ErrorLog.findOne({
      where : {
        origin   : payload.origin || 'API',
        code     : payload.code   || 'UNKNOWN_CODE',
        message  : payload.message,
        resolved : false
      }
    });

    if (log) {
      yield log.update({
        count : log.count + 1
      });
      debug(`Log > Incremented reoccuring error ${ log.code }, First@${ moment(log.createdAt).calendar() }, Last@${ moment(log.updatedAt).calendar() }, occurances ${ log.count }.`);
      return;
    }

    // ### Log Error

    log = new ErrorLog({
      origin   : payload.origin   || 'API',
      code     : payload.code     || 'UNKNOWN_CODE',
      message  : payload.message,
      solution : payload.solution,
      data     : payload.data ? JSON.stringify(payload.data, null, 2) : null,
      stack    : payload.stack    || null,
      route    : payload.route    || null,
      uri      : payload.uri      || null,
      resolved : payload.resolved || false
    });
    yield log.save();

    // ### Debug

    debug(`Log > Logged ${ payload.code } error with the 'log_errors' table.`);

    // ### Hook

    yield hooks.call('log:error', log);

    return log;
  }

  /**
   * Logs a new payload with the database so it can be tracked.
   * @param  {Object} payload
   * @return {Object}
   */
  static *event(payload) {
    let log = new EventLog({
      origin   : payload.origin || 'API',
      userId   : payload.userId || null,
      type     : payload.type,
      value    : payload.value,
      resolved : payload.resolved || true
    });
    yield log.save();

    // ### Debug

    debug(`Log > Logged ${ payload.type } with the 'log_events' table.`);

    // ### Hook

    yield hooks.call('log:event', log);

    return log;
  }

  /**
   * Returns a indexed result of the current logs of the request type.
   * @param  {String} type
   * @param  {Object} query
   * @return {Array}
   */
  static *index(type, query) {
    switch (type) {
      case 'error' : {
        return yield ErrorLog.find(queryParser(query, {
          where : {
            origin   : queryParser.STRING,
            code     : queryParser.STRING,
            resolved : queryParser.BOOLEAN
          }
        }));
      }
      case 'event' : {
        return yield EventLog.find(queryParser(query, {
          where : {
            origin : queryParser.STRING,
            type   : queryParser.STRING
          }
        }));
      }
      default : {
        throw error.parse({
          code    : `INVALID_LOG_TYPE`,
          message : `The log type provided is invalid.`,
          data    : {
            type : type
          }
        }, 400);
      }
    }
  }

  /**
   * Updates a log.
   * @param  {String} type
   * @param  {Number} id
   * @param  {Object} payload
   * @return {Object}
   */
  static *update(type, id, payload) {
    let log = yield this.getLog(type, id);
    yield log.update(payload);
    return log;
  }

  /**
   * Sets an logged error event to resolved.
   * @param  {String} type
   * @param  {Number} id
   * @return {Object}
   */
  static *resolve(type, id) {
    let log = yield this.getLog(type, id);
    yield log.update({
      resolved : true
    });
    return log;
  }

  /**
   * Attempts to retrieve a log by its log type.
   * @param  {String} type
   * @param  {Number} id
   * @return {Object}
   */
  static *getLog(type, id) {
    let log = null;
    switch (type) {
      case 'error' : log = yield this.getErrorLog(id); break;
      case 'event' : log = yield this.getEventLog(id); break;
      default      : {
        throw error.parse({
          code    : `INVALID_LOG_TYPE`,
          message : `The log type provided is invalid.`,
          data    : {
            type : type
          }
        }, 400);
      }
    }
    return log;
  }

  /**
   * Attempts to retrieve a error log from the database.
   * @param  {Number} id
   * @return {Object}
   */
  static *getErrorLog(id) {
    let log = yield ErrorLog.findById(id);
    if (!log) {
      throw error.parse({
        code    : `LOG_NOT_FOUND`,
        message : `THe log requested was not found in our records.`,
        data    : {
          id : id
        }
      }, 404);
    }
    return log;
  }

  /**
   * Attempts to retrieve a error log from the database.
   * @param  {Number} id
   * @return {Object}
   */
  static *getEventLog(id) {
    let log = yield EventLog.findById(id);
    if (!log) {
      throw error.parse({
        code    : `LOG_NOT_FOUND`,
        message : `THe log requested was not found in our records.`,
        data    : {
          id : id
        }
      }, 404);
    }
    return log;
  }

};

/**
 * Prints debug message when not in testing mode.
 * @param  {String} val
 */
function debug(val) {
  if (!Bento.isTesting()) {
    logs.debug(val);
  }
}
