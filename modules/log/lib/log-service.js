'use strict';

let shortid     = require('shortid');
let moment      = require('moment');
let queryParser = Bento.provider('sequelize/helpers').query;
let ErrorLog    = Bento.model('ErrorLog');
let EventLog    = Bento.model('EventLog');
let Booking     = Bento.model('Booking');
let Log         = Bento.model('Log');
let hooks       = Bento.Hooks;
let error       = Bento.Error;
let logs        = Bento.Log;
let CarService  = require('../../waivecar/lib/car-service');

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

  static *stats(day){
    //
    // An implementation of https://github.com/clevertech/Waivecar/issues/623
    //
    // A generic interface to the database could exist, but it already does,
    // it's called SQL - so let's not re-invent that.
    //
    // The items here are 
    //
    // % fleet available to rent, per day
    // % fleet actively rented, per day
    // miles per car, per day
    // time between bookings, per car
    // time car is registered below 30% charge, rotated to base to charged
    // time cars spend offline vs. available to rent
    // $$ earned per car, per fleet, per day
    // impressions per car, per day
    // reservations completed per day v. app logins
    // app downloads, and trends of usage 
    // abandoned reservations for reservations that are driven off
    // number of users in a car before a WaiveCar employee/contract touches the car (charges it, cleans it, rotates, etc)
    //
    // So we are just going to knock that off one by one.
    // 
    let 
      id = false,
      report = {},
      // It's *probably* easier if we distribute these records by car
      evByCar = {}, 
      bookByCar = {},
      licenseMap = yield CarService.id2license();

    // see http://stackoverflow.com/questions/6273361/mysql-query-to-select-records-with-a-particular-date
    // for a discussion on the 'best' way to do this.
    let range = { $between: [day, `${day} 23:59:59`] };
  
    // we'll use this query to answer a number of questions.
    let allBookings = yield Booking.find({
      where : {
        status : { $in : [ 'completed', 'closed', 'ended' ] },
        created_at : range
      },
      order : [ 
        ['created_at', 'ASC'],
        ['car_id', 'ASC']
      ],
      include : [
        {
          model : 'BookingDetails',
          as    : 'details'
        }
      ]
    });

    let allEvents = yield Log.find({
      where : { created_at : range },
      order : [ ['created_at', 'ASC'] ]
    });

    // These should already be done by date so yeah, that's convenient.
    allBookings.forEach((row) => {
      let id = licenseMap[row.carId];

      if( ! (id in bookByCar) ) {
        bookByCar[id] = [];
      }
      bookByCar[id].push(row);
    });

    // Now yes, this could be assembled in some *mega* structure but 
    // given what we are actually doing with the data, this is more
    // sensible ... you'll see, you'll see.
    allEvents.forEach((row) => {
      let id = licenseMap[row.carId];

      if( ! (id in evByCar) ) {
        evByCar[id] = [];
      }
      evByCar[id].push(row);
    });

    // now we tack them off one by one
    // let's list the incomplete ones first.
   
    // time car is registered below 30% charge, rotated to base to charged
    // TODO: We don't track this in the database
    //   We have the inverse flat text log which
    //   does ostensibly have these but we'd have
    //   to parse those.
    
    // reservations completed per day v. app logins
    // TODO: We don't track logins but we can 
    //    can certainly do a per car thing.
    report.booking_count = {};
    for(id in bookByCar) {
      report.booking_count[id] = bookByCar[id].length;
    }
    
    // % fleet actively rented, per day 
    // well ... we'll do a number.
    report.active_count = Object.keys(bookByCar).length;

    // % fleet available to rent, per day
    // eh, this is technically what has events at all
    // for a given day. 
    //
    // I believe generally active === available
    report.available_count = Object.keys(evByCar).length;
    
    // miles per car, per day
    report.miles = {};
    for(id in bookByCar) {
      let carLog = bookByCar[id];

      report.miles[id] = Math.round( 

        // This is the last recorded odometer reading for that day, at the end of the last ride
        carLog[carLog.length - 1].details[1].mileage - 

        // subtracted from the initial odometer reading.
        carLog[0].details[0].mileage
      );
    }

    // time between bookings, per car
    // this one is somewhat ambiguous ... Taken literally this is
    //
    // sum( [ CREATE_BOOKING | MAKE_CAR_UNAVAILABLE ] - MAKE_CAR_AVAILABLE ) 
    //              -----
    //       booking.length - 1
    //
    // This doesn't take into consideration *available* time which is 
    // likely more useful.
    report.available = {};
    for(id in evByCar) {
      let avail_time = 0, ttl = 0, isAvail = false, start;

      evByCar[id].forEach((row) => {
        if (row.action === 'MAKE_CAR_AVAILABLE') {
          isAvail = true;
          start = row.createdAt;
        } else if (isAvail && (
          row.action === 'CREATE_BOOKING' ||
          row.action === 'MAKE_CAR_UNAVAILABLE'
        )) {
          isAvail = false;
          ttl ++;
          avail_time += new Date(row.createdAt) - new Date(start);
        }
      });
      report.available[id] = ttl > 0 ? Math.floor(avail_time / ttl / 1000) : -1;
    } 

    // time cars spend offline vs. available to rent
    // The available time is the one above. We'll track
    // the unavailable time here.
    report.unavailable = {};
    for(id in evByCar) {
      let unavail_time = 0, ttl = 0, isUnavail = false, start;

      evByCar[id].forEach((row) => {
        if (row.action === 'MAKE_CAR_UNAVAILABLE') {
          isUnavail = true;
          start = row.createdAt;
        } else if (isUnavail && row.action === 'MAKE_CAR_AVAILABLE') {
          isUnavail = false;
          ttl ++;
          unavail_time += new Date(row.createdAt) - new Date(start);
        }
      });
      report.unavailable[id] = ttl > 0 ? Math.floor(unavail_time / ttl / 1000) : -1;
    } 

    // $$ earned per car, per fleet, per day
    // impressions per car, per day
    //
    // app downloads, and trends of usage 
    // abandoned reservations for reservations that are driven off
    // number of users in a car before a WaiveCar employee/contract touches the car (charges it, cleans it, rotates, etc)
    return report;
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
