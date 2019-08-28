'use strict';

let error = Bento.Error;

// We are handling both type of log - since the separation is confusing
// and not helpful.
let Log = Bento.model('Log');
let Location  = Bento.model('BookingLocation');
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');

let queryParser  = Bento.provider('sequelize/helpers').query;
let _  = require('lodash');
let fs = require('fs');

class LogService {

  static *create(payload, _user) {
    let log = new Log(payload);

    if (_user) {
      payload.actorId = _user.id;
    } else {
      payload.actorId = 0;
    }
    log.actorId = payload.actorId;
    payload.t = new Date();

    fs.appendFile('/var/log/invers/log.txt', JSON.stringify(payload) + "\n", function(){});

    yield log.save();

    log = yield this.getLog(log.id);
    return log;
  }

  static *index(query, _user) {
    query = _.extend(queryParser(query, {
      where : {
        userId    : queryParser.NUMBER,
        carId     : queryParser.STRING,
        action    : queryParser.STRING,
        bookingId : queryParser.NUMBER,
        actorId   : queryParser.NUMBER
      }
    }), this.getRelations());

    return yield Log.find(query);
  }

  static *bookingHistory(query, id) {
    let params = {
      attributes: ['id', 'latitude', 'longitude', 'created_at'],
      where: { booking_id: id },
      order: [ ['created_at', 'asc'] ]
    };

    let locations = yield Location.find(params);

    if (!locations || !locations.length) {
      return {res: true, data: {}};
    }

    let flat = locations.map( (row) => { return [row.latitude, row.longitude, row.createdAt] });

    return {
      res: true,
      len: locations.length,
      data: {
        data: flat
      }
    };
  }

  static *carHistory(query, id) {
    //
    // this is from https://github.com/clevertech/Waivecar/issues/590
    //
    // have 3 optional parameters
    // 
    //     limit: return no more than x results
    //     first: return no results before this id
    //     last: return no results after this id
    // 
    // The response will be as specified above
    // 
    // {
    //   data: [ ... current stuff ... ]
    //   first: [ first id ]
    //   last: [ last id ]
    // }
    // 
    // Some notes
    // 
    //     Since ids are distributed among all cars, the number of records between x and y are necessarily <= x-y.
    //     If there's a
    //         limit and a first: the limit applies to those incrementing after the first.
    //         limit and a last: the limit goes backwards from the last
    //         limit and a first and a last: the limit goes forward from the first, and the 
    //         results may have a new last since the limit is also observed.
    //
    let limit = parseInt(query.limit || 250, 10);
    let first = query.first;
    let last = query.last;
    let doReverse = false;
    let params = {};
    let car = null;

    // The device ids are 17 letters long while california licenses are 7 ... so
    // this is a huge difference. If we have a lengthy id that is querying then
    // we can just bypass trying to look up the car, we have everything we need.
    //
    // This takes off about 10ms in practice from a 40ms call, so it's a 25% savings.
    //
    if (id.length < 13) {
      car = yield Car.findOne({ where: { license: id }});
    }
    if (!car) {
      car = { id: id };
    }

    // A big issue that we may get ALL the bookings regardless of the limit 
    // ... this is turned on its head by limiting ourselves to the range 
    // operators (first and last) and then getting the subset of bookings 
    // within that. 
    //
    // The use case here is if someone is looking at recent bookings,
    // say in real-time, then normally there will be nearly 0 - this is 
    // really the only one that's being done.
    //
    // In practice this runtime is around 40 ms versus 200 if this wasn't here.
    //
    params = {
      attributes: ['id'],
      where: { carId: car.id, status: { $not: 'cancelled' } },
      order: [ [ 'id', 'desc' ] ]
    };

    if (first === undefined) {
      // If nothing was specified we only look at a handful of the most recent bookings.
      params.limit = 7;
    } else {
      let recentBookings = yield Location.find({
        attributes: [ 'booking_id' ],
        where: { id : { $gte: first } },
        order: [ [ 'booking_id', 'asc' ] ],
        limit: 1
      });

      if (recentBookings) {
        // if there is nothing here then nothing will match so
        // we can just return no results now.
        if (!recentBookings.length) {
          return {res: true, data: {}};
        }

        // otherwise we can just be simple and take
        // the first as the lowerbound for looking for our
        // car bookings.
        params.where.id = { $gte: recentBookings[0].bookingId };
      }
    }

    let bookings = yield Booking.find(params);
    if (!bookings) {
      return { res: false, data: `Found No Booking for ${ id } ${ car.id }.` };
    }

    let bookingsById = bookings.map( (row) => { return row.id; } );

    params = {
      attributes: ['id', 'latitude', 'longitude', 'created_at'],
      where: { booking_id: { $in: bookingsById } },
      limit: limit
    };

    // This isn't just a duck-typed 'not' operator because
    // first can reasonably be '0'.
    if (first !== undefined) {
      // If we have a first specified then we return
      // from that point moving forward.
      params.order = [ ['created_at', 'asc'] ];

      if (last) {
        params.where.id = { $between: [first, last] };
      } else {
        // only a first defined
        params.where.id = { $gte: first };
      }
    } else { 
      // With no first defined we go backwards
      params.order = [ ['created_at', 'desc'] ];

      // and then remind ourselves to reverse things
      doReverse = true;
 
      if (last) {
        // only a last defined
        params.where.id = { $lte: last };
      }
    }

    let locations = yield Location.find(params);

    if (!locations || !locations.length) {
      return {res: true, data: {}};
    }

    if (doReverse) {
      locations = locations.reverse();
    }

    let flat = locations.map( (row) => { return [row.latitude, row.longitude, row.createdAt] });

    return {
      res: true,
      data: {
        car: car.id,
        first: locations[0].id,
        last: locations[locations.length - 1].id,
        data: flat
      }
    };
  }

  static *getLog(id) {
    let log = yield Log.findById(id, this.getRelations());
    if (!log) {
      throw error.parse({
        code    : `LOG_NOT_FOUND`,
        message : `The requested log does not exist.`,
        data    : {
          logId : parseInt(id)
        }
      }, 400);
    }

    return log;
  }

  static getRelations() {
    return {
      include : [
        {
          model : 'User',
          as    : 'actor'
        },
        {
          model : 'User',
          as    : 'user'
        },
        {
          model : 'Booking',
          as    : 'booking'
        },
        {
          model : 'Car',
          as    : 'car'
        }
      ]
    };
  }

  static getActions() {
    return {
      CREATE_BOOKING       : 'CREATE_BOOKING',
      END_BOOKING          : 'END_BOOKING',
      COMPLETE_BOOKING     : 'COMPLETE_BOOKING',
      CLOSE_BOOKING        : 'CLOSE_BOOKING',
      LOCK_CAR             : 'LOCK',
      UNLOCK_CAR           : 'UNLOCK',
      OPEN_DOOR_CAR        : 'OPEN_DOOR',
      CLOSE_DOOR_CAR       : 'CLOSE_DOOR',
      IMMOBILIZE_CAR       : 'IMMOBILIZE',
      UNIMMOBILIZE_CAR     : 'UNIMMOBILIZE',
      RENTABLE             : 'RENTABLE',
      RETRIEVE             : 'RETRIEVE',       
      INSTABOOK            : 'INSTABOOK',
      INSTAEND             : 'INSTAEND',
      MAKE_CAR_AVAILABLE   : 'MAKE_CAR_AVAILABLE',
      MAKE_CAR_UNAVAILABLE : 'MAKE_CAR_UNAVAILABLE',
      START_CHARGE         : 'START_CHARGE',
      IGNITION_ON          : 'IGNITION_ON',
      IGNITION_OFF         : 'IGNITION_OFF',
      END_CHARGE           : 'END_CHARGE'
    };
  }
};

module.exports = LogService;
