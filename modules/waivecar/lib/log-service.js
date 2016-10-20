'use strict';

let error = Bento.Error;

// We are handling both type of log - since the separation is confusing
// and not helpful.
let Log = Bento.model('Log');
let Locations = Bento.model('BookingLocation');
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');

let queryParser  = Bento.provider('sequelize/helpers').query;
let _ = require('lodash');

class LogService {

  static *create(payload, _user) {
    let log = new Log(payload);
    log.actorId = _user.id;

    yield log.save();

    log = yield this.getLog(log.id);
    log.relay('store', 'logs');
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

  static *carHistory(id) {
    //let startTime = new Date();
    let car = yield Car.findOne({where: {license: id }});
    if (!car) {
      console.log(`>> Found NO CAR for ${ id }.`);
      return false;
    }

    let carId = car.id;
    //console.log(">> Using " + carId);
    let bookings = yield Booking.find({
      attributes: ['id'],
      where: { carId: carId } 
    }); 

    if (!bookings) {
      //console.log(`>> Found NO BOOKINGS for ${carId}`);
      return false;
    }
    let bookingsById = bookings.map( (row) => { return row.id; } );
    //console.log(">> Found " + bookingsById.length + " bookings.");

    let locations = yield Locations.find({ 
      attributes: ['latitude', 'longitude', 'created_at'],
      order: [ ['created_at', 'desc'] ],
      where: {booking_id: { $in: bookingsById } } 
    });

    if (!locations) {
      //console.log(`>> Found NO LOCATIONS for ${carId}`);
      return false;
    }
    //console.log(`>> Found ${ locations.length } locations`);
    return locations;
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
      LOCK_CAR             : 'LOCK_CAR',
      UNLOCK_CAR           : 'UNLOCK_CAR',
      IMMOBILIZE_CAR       : 'IMMOBILIZE_CAR',
      UNIMMOBILIZE_CAR     : 'UNIMMOBILIZE_CAR',
      MAKE_CAR_AVAILABLE   : 'MAKE_CAR_AVAILABLE',
      MAKE_CAR_UNAVAILABLE : 'MAKE_CAR_UNAVAILABLE',
    };
  }
};

module.exports = LogService;
