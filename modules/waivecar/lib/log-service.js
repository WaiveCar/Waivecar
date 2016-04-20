'use strict';

let error = Bento.Error;
let Log = Bento.model('Log');
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
