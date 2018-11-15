'use strict';

let shortid     = require('shortid');
let moment      = require('moment');
let queryParser = Bento.provider('sequelize/helpers').query;
let ErrorLog    = Bento.model('ErrorLog');
let EventLog    = Bento.model('EventLog');
let Booking     = Bento.model('Booking');
let Log         = Bento.model('Log');
let Location    = Bento.model('BookingLocation');
let CarHistory  = Bento.model('CarHistory');
let sequelize   = Bento.provider('sequelize');
let GroupUser   = Bento.model('GroupUser');
let hooks       = Bento.Hooks;
let error       = Bento.Error;
let logs        = Bento.Log;
let _           = require('lodash');
const util = require('util')

module.exports = class LogService {

  static *create(type, payload) {
    switch (type) {
      case 'error' : return yield this.error(payload);
      case 'event' : return yield this.event(payload);
    }
  }

  static *stats(day) {
    // There's a circular dependency here. Make sure you know what you're doing
    // before you 'refactor' this to the top.
    let CarService  = require('../../waivecar/lib/car-service');

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
    // $$ earned per car, per fleet, per day - in excess charges
    // impressions per car, per day
    // reservations completed per day v. app logins
    //
    // app downloads, and trends of usage 
    //
    //    7 day moving window of number of users who registered versus number of users
    //    who drove a car for the first time.
    //
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
    //
    // The report is essentially a csv file that looks like this
    //
    //      stat | stat | stat
    // car1  xx     xx     xx
    // car2  xx     xx     xx
    // car3  xx     xx     xx
    //
    //
    // key | value
    // key | value
    //
    // We're going to call this the 'table' and 'kv'.
    let kv = [
      // some breathing room.
      [],
      ['Stats'],
      ['Total Active', report.active_count],
      ['Total Available', report.available_count]
    ];
    let table = [
      [ 'Car', 'Unavailable', 'Available', 'KM', 'Bookings' ]
    ];

    // I'd like to more or less get the cars to do things
    // in the same order each day.
    Object.keys(evByCar).sort().forEach(function(id) {
      table.push([
         id,    
         report.unavailable[id],
         report.available[id],
         report.miles[id],
         report.booking_count[id]
      ]);
    });

    // Apparently the node versions of csv writers want streams, which
    // mean promises, which mean yeah, what the fuck node, why do you
    // do stupid shit and make things so fucking hard that *should*
    // *be* *easy*. Fuck you node, fuck you. Now I'm doing my own 
    // csv engine ... and this is the thing I always complain to others
    // about.
    return table.concat(kv).map(function(row) { 
      return row.join(',');
    }).join('\n');
  }

  static *revenue(start, end) {
    start = parseInt(start || "1", 10);
    end = parseInt(end || "0", 10);
    
    let qstr = "select sum(amount) as ttl,count(*) as charges,first_name,last_name,users.status,users.credit,users.id from shop_orders join users on users.id = shop_orders.user_id where shop_orders.status='paid' and amount < 10000 and shop_orders.created_at > date_sub(current_date, interval " + start + " month) and shop_orders.created_at < date_sub(current_date, interval " + end + " month) group by user_id order by ttl desc";

    return yield sequelize.query(qstr, {type: sequelize.QueryTypes.SELECT});
  }

  // year_month should be in the format of
  // YYYY-MM
  // You can also have a duration, such as:
  // YYYY-MM_1+month
  static *report(year_month, kind, query) {
    // There's a circular dependency here. Make sure you know what you're doing
    // before you 'refactor' this to the top.
    let CarService  = require('../../waivecar/lib/car-service');
    let Car = Bento.model('Car');

    //
    // Total number of rides taken/times the vehicle was rented
    // Total number of drivers
    // Total miles driven by the fleet
    // Total impressions from website and app
    // Any additional metrics they measure and/or think would be interesting
    // 
    // fleet members are
    //
    // select user_id from group_users where group_role_id > 1; 
    //
    let 
      report = {},
      // It's *probably* easier if we distribute these records by car
      bookByCar = {},
      carOdometer = {},
      bookBy = {user: {}, fleet: {} },
      totalDistance = {user: 0, fleet: 0},
      totalBookings = {user: 0, fleet: 0},
      start = {year:0, month:1, day:1},
      excludeMap = {},
      includeMap = {},
      allExcludedBookings,
      excludedBookingsQuery = '',
      includedBookingsQuery = '',
      allCars = yield Car.find({
         include: [
           {
             model : 'GroupCar',
             as    : 'tagList'
           }
         ]
      });


    // we allow for custom duration
    let duration_parts = year_month.split('_');
    let duration = false;

    if(duration_parts.length > 1) {
      duration = duration_parts[1];
    } 
    let parts = year_month.split('-');
    start.year = parseInt(parts[0], 10);

    if(parts.length > 1) {
      duration = duration || '1 month';
      start.month = parseInt(parts[1], 10);

      if(parts.length > 2) {
        duration = duration || '1 week';
        start.day = parseInt(parts[2], 10);
      }
    }
    duration = duration || '1 year';

    let dtStr = `${start.year}-${start.month}-${start.day} 00:00:00`;
    let end = `DATE_ADD("${dtStr}", interval ${duration})`;

    //
    // This is where we determine what cars we are looking at. As far as the query goes,
    // the ?scope=XXX parameter determines this.  Since documentation is the first thing
    // to code rot, I recommend looking at the loop to see the options.
    //
    query.scope = query.scope || 'ioniq';
    if(!['ioniq','all','level'].includes(query.scope)) { 
      let carList = query.scope.toUpperCase().split(',').map((row) => {
        return row.indexOf('W') === -1 ? ('WAIVE' + row) : row;
      });
       
      var fuckThesePeople = false;
      allCars.forEach((row) => {
        if(fuckThesePeople || carList.includes(row.id)) {
          fuckThesePeople = true;
          return;
        }
        if(carList.includes(row.id) || carList.includes(row.license.toUpperCase())) {
          includeMap[row.id] = row.license;
        } 
      });
      console.log(includeMap);
      if(fuckThesePeople) {
        return [];
      }
      excludeMap = false;
      if(Object.keys(includeMap).length === 0) {
        return [];
      }
    } else {
      for(var ix = 0; ix < allCars.length; ix++) {
        let row = allCars[ix];
        if(query.scope === 'all') {
          includeMap[row.id] = row.license;
        } else if(query.scope === 'ioniq') {
          if(row.license.match(/waive1?\d$/i) || row.license.match(/waive20$/i)) {
            excludeMap[row.id] = row.license;
          } else {
            includeMap[row.id] = row.license;
          }
        } else if(query.scope === 'level') {
          if((yield row.hasTag('level')) && row.license.indexOf('WORK') === -1) {
            includeMap[row.id] = row.license;
          } else {
            excludeMap[row.id] = row.license;
          }
        }
      }
    }

    // see http://stackoverflow.com/questions/6273361/mysql-query-to-select-records-with-a-particular-date
    // for a discussion on the 'best' way to do this.
    let range = { $between: [dtStr, sequelize.literal(end)] };
    // we'll use this query to answer a number of questions.
    let allBookingsQuery = {
      where : {
        status : { $in : [ 'completed', 'closed', 'ended', 'started' ] },
        created_at : range,
        car_id : { $in : Object.keys(includeMap) }
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
    };
    let allBookings = yield Booking.find(allBookingsQuery);

    if(excludeMap !== false) {
      allExcludedBookings = yield Booking.find({
        where : {
          created_at : range,
          car_id : { $in : Object.keys(excludeMap) }
        },
      });

      if(allExcludedBookings.length) {
        excludedBookingsQuery = ' booking_id not in (' + allExcludedBookings.map((row) => { return row.id } ) + ') and ';
      }
    } else {
      if(allBookings.length === 0) {
        return [];
      }
      includedBookingsQuery = ' booking_id in (' + allBookings.map((row) => row.id) + ') and ';
    }


    let dateRange = `bl.created_at > '${dtStr}' and bl.created_at < ${end}`;
    if(kind === 'parking') {
      let qstr = [
        'select bl.created_at,bl.longitude,bl.latitude,street_hours,street_minutes,street_overnight_rest,concat("https://s3.amazonaws.com/waivecar-prod/",path) as image',
        'from parking_details pd join booking_details bl on bl.booking_id = pd.booking_id',
        `where ${excludedBookingsQuery} bl.type = 'end' and`,
        dateRange,
      ].join(' ');

      return yield sequelize.query(qstr, {type: sequelize.QueryTypes.SELECT});

    } else if(kind === 'carpoints') {
      
      let qstr = [
        'select car_id, longitude, latitude, bl.created_at',
        `from bookings join booking_locations bl on bookings.id = bl.booking_id where `,
        excludedBookingsQuery,
        includedBookingsQuery,
        dateRange
      ].join(' ');

      return yield sequelize.query(qstr, {type: sequelize.QueryTypes.SELECT});

    } else if(kind === 'points' || kind === 'points.js') {
      let qstr = [
        'select round(longitude,4) as lng, round(latitude,4) as lat, count(*) as weight',
        `from booking_locations bl where`,
        excludedBookingsQuery,
        includedBookingsQuery,
        dateRange,
        'group by(concat(lng,lat))'
      ].join(' ');

      let res = (yield sequelize.query(qstr,  {type: sequelize.QueryTypes.SELECT})).map((row) => {
        return [row.lat, row.lng, row.weight];
      });

      return kind === 'points.js' ? ('var points = ' + JSON.stringify(res)) : res;
    }
   
    let allOdometers = yield CarHistory.find({
      where : {
        action: 'ODOMETER',
        created_at : range,
        car_id : { $in : Object.keys(includeMap) }
      },
      order : [ 
        ['created_at', 'ASC'],
        ['car_id', 'ASC']
      ]
    });

    // this means we are looking pretty far back and can't use that table
    // for the odo readings ... woops.
    if(allOdometers.length === 0) {
      allBookings.forEach((row) => {
        let id = includeMap[row.carId];
        if( ! (id in bookByCar) ) {
          bookByCar[id] = [];
          carOdometer[id] = [Number.MAX_VALUE, 0];
        }
        carOdometer[id][0] = Math.min(row.details[0].mileage, carOdometer[id][0]);
        carOdometer[id][1] = Math.max(row.details[1].mileage, carOdometer[id][1]);
      });
    } else {

      allOdometers.forEach((row) => {
        let id = includeMap[row.carId];
        if( ! (id in bookByCar) ) {
          bookByCar[id] = [];
          carOdometer[id] = [Number.MAX_VALUE, 0];
        }
        carOdometer[id][0] = Math.min(+row.data, carOdometer[id][0]);
        carOdometer[id][1] = Math.max(+row.data, carOdometer[id][1]);
      });
    }

    // These should already be done by date so yeah, that's convenient.
    allBookings.forEach((row) => {
      let id = includeMap[row.carId];
      let userId = row.userId;
      let userType = 'user';

      if( ! (id in bookByCar) ) {
        bookByCar[id] = [];
      }
      bookByCar[id].push(row);

      totalBookings[userType] ++;
      if( ! (userId in bookBy[userType]) ) {
        bookBy[userType][userId] = [];
      }
      bookBy[userType][userId].push(row);

      if(row.details.length > 1) {
        totalDistance[userType] += Math.abs(row.details[0].mileage - row.details[1].mileage);
      }
    });

    for(var car in carOdometer) {
      if(carOdometer[car][0] === carOdometer[car][1]) {
        delete carOdometer[car];
        delete bookByCar[car];
      }
    }

    let odometerReading = _.values(carOdometer).reduce((accumulator, row) => {
        return Math.abs(row[1] - row[0]) + accumulator;
      }, 0);

    totalDistance.odometer = odometerReading;
    totalDistance.fleetDerived = odometerReading - totalDistance.user;

    let details = {};
    for(var id in carOdometer) {
      details[id] = {
        start: carOdometer[id][0],
        end: carOdometer[id][1],
        bookings: bookByCar[id].length
      }
      details[id].distance = details[id].end - details[id].start;
      details[id].average = details[id].distance / details[id].bookings;
    }

    return {
      period: duration_parts[0],
      duration: duration,
      activeCars: Object.keys(bookByCar),
      activeCarCount: Object.keys(bookByCar).length,
      userCount:  Object.keys(bookBy.user).length,
      numberOfRides: totalBookings,
      details: details,
      distance: totalDistance
    };
  }

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

  //
  // who is either a number or a user object.  Either
  //  way we'll try our best to extract the userid
  //
  // what is a preferably all caps, one word reason for
  //  the event, such as 'DECLINED' for a cc decline
  //
  // details is terribly hard to explain, it's 'smart'.
  //  If it's a number, it also becomes the referenceId,
  //  it always gets JSON.stringified as the 'value' column
  //  value 
  //
  static *addUserEvent(who, what, details, comment) {
    var obj = {
      type: what,
      value: details || '',
      resolved: false,
      comment: comment
    };

    if (who.id) {
      who = who.id;
    }
    obj.userId = who;

    if (_.isNumber(details)) {
      obj.referenceId = details;
    }

    if (!_.isString(details) ) {
      obj.value = JSON.stringify(details);
    }

    return yield this.event(obj);
  }

  static *event(payload) {
    let log = new EventLog({
      userId      : payload.userId || null,
      type        : payload.type,
      value       : payload.value,
      resolved    : ('resolved' in payload) ? payload.resolved : true,
      comment     : payload.comment || null,
      referenceId : payload.referenceId || null
    });

    yield log.save();

    debug(`Log > Logged ${ payload.type } with the 'log_events' table.`);

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
        let qp = queryParser(query, {
          where : {
            origin : queryParser.STRING,
            type   : queryParser.STRING,
            userId : queryParser.NUMBER
          }
        });
        qp.order = [[ 'id', 'DESC' ]];

        return yield EventLog.find(qp);
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
