'use strict';

let co          = require('co');
let parallel    = require('co-parallel');
let request     = require('co-request');
let moment      = require('moment');
let notify      = require('./notification-service');
let Service     = require('./classes/service');
let LogService  = require('./log-service');
let Actions     = LogService.getActions();
let queue       = Bento.provider('queue');
let queryParser = Bento.provider('sequelize/helpers').query;
let changeCase  = Bento.Helpers.Case;
let access      = Bento.Access;
let error       = Bento.Error;
let relay       = Bento.Relay;
let log         = Bento.Log;
let config      = Bento.config.waivecar;
let hooks       = Bento.Hooks;

let User = Bento.model('User');
let Car  = Bento.model('Car');
let Booking = Bento.model('Booking');

let fs = require('fs');

module.exports = {

  /**
   * Track api errors to notify admins
   */
  _errors : {},

  /**
   * Returns a list of cars from the local database.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  *index(query, _user) {
    let options = queryParser(query, {
      where : {
        id          : queryParser.STRING,
        userId      : queryParser.NUMBER,
        isAvailable : queryParser.BOOLEAN
      }
    });

    if (_user && !_user.hasAccess('admin')) {
      options.where.adminOnly = false;
    }

    options.limit = 100;
    let cars = yield Car.find(options);
    let bookings = yield Booking.find({ where : { status : 'started' } });

    bookings.forEach(function(booking) {
      cars.forEach(function(car) {
        if (car.id === booking.carId) {
          car.bookingId = booking.id;
        }
      });
    });

    return cars;
  },

  // This is the do-nothing thing that is in reference
  // to https://github.com/clevertech/Waivecar/issues/577
  // There's more rationale as to the placement of this 
  // in the controller comment
  *ping() {
    return true;
  },

  /**
   * Returns a car based on provided id from the local database.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  *show(id, _user) {
    let car = yield Car.findById(id, {
      include : [
        {
          model : 'User',
          as    : 'user'
        }
      ]
    });

    let data  = yield hooks.call('cars:show:after', car);

    return data;
  },

  /**
   * @param  {Number} id
   * @param  {Object}  payload
   * @param  {Object} _user
   * @return {Mixed}
   */
  *update(id, payload, _user) {
    access.verifyAdmin(_user);

    let car = yield Car.findById(id);
    if (!car) {
      throw error.parse({
        code    : 'CAR_SERIVCE_NOT_FOUND',
        message : 'The car has not been registered in our database.',
        data    : {
          id : id
        }
      }, 404);
    }
    let device = yield this.getDevice(car.id, _user);

    yield car.update(Object.assign(device || {}, payload));
    relay.emit('cars', {
      type : 'update',
      data : car.toJSON()
    });

    return car;
  },

  *updateAvailabilityAnonymous(id, isAvailable, _user) {
    let model = yield Car.findById(id);
    if (isAvailable) {
      yield model.available();
    } else {
      yield model.unavailable();
    }

    relay.emit('cars', {
      type : 'update',
      data : model.toJSON()
    });

    if (_user) yield LogService.create({ carId : id, action : isAvailable ? Actions.MAKE_CAR_AVAILABLE : Actions.MAKE_CAR_UNAVAILABLE }, _user);

    return model;
  },

  /**
   * @param  {Number}  id
   * @param  {Boolean} isAvailable
   * @param  {Object}  _user
   * @return {Mixed}
   */
  *updateAvailability(id, isAvailable, _user) {
    access.verifyAdmin(_user);

    let model = yield this.updateAvailabilityAnonymous(id, isAvailable, _user);

    return model;
  },

  /**
   * @param {String} id
   * @param {Boolean} isVisible
   * @param {Object} _user
   * @return {Object}
   */
  *updateVisibility(id, isVisible, _user) {
    access.verifyAdmin(_user);
    let model = yield Car.findById(id);

    if (isVisible) {
      yield model.visible();
    } else {
      yield model.hidden();
    }

    relay.emit('cars', {
      type : 'update',
      data : model.toJSON()
    });

    return model;
  },

  /**
   * Updates the local car with the remote fleet device.
   * @param {String} deviceId
   */
  *refresh(deviceId) {
    let updatedCar = yield this.getDevice(deviceId);
    if (updatedCar) {
      log.debug(`Cars : Refresh : updating ${ deviceId }.`);
      yield this.syncUpdate(deviceId, updatedCar);
    } else {
      log.debug(`Cars : Refresh : failed to retrieve ${ deviceId } to update database.`);
    }
    return yield Car.findById(deviceId);
  },

  /**
   * A convenience method to update the local Car (to enable pre-save model transformations)
   * @param  {Number} id          car Id
   * @param  {Object} data        update data to persist
   * @param  {Object} existingCar existing Car to update (optional)
   * @param  {Object} _user       user (optional)
   * @return {Object}             updated Car
   */
  *syncUpdate(id, data, existingCar, _user) {
    if (!existingCar) {
      existingCar = yield Car.findById(id);
    }

    if (!existingCar.license) {
      let meta = config.car.meta[existingCar.id];
      if (meta) {
        data.license = meta.license;
      }
    }

    if (data.currentSpeed === 0) {
      if (existingCar.distanceSinceLastRead === 0) {
        delete data.positionUpdatedAt;
      }
      data.isParked = (data.currentSpeed === 0) && (!data.isIgnitionOn);
    }

    existingCar.addToHistory(data.charge);
    data.chargeHistory = existingCar.chargeHistory;

    yield existingCar.update(data);

    relay.emit('cars', {
      type : 'update',
      data : existingCar.toJSON()
    });

    return existingCar;
  },

  /**
   * Does sync operations against all cars in the invers fleet.
   * @return {Array}
   */
  *syncCars() {
    log.debug('CarService : syncCars : start');
    let refreshAfter = config.car.staleLimit || 15;

    // Retrieve all local cars.

    let allCars = yield Car.find();

    // Filter cars to include either:
    // 1. car is currently in a booking (i.e. not available), or
    // 2. car has never been updated, or
    // 3. car has not been updated for more than [refreshAfter] minutes.

    let stale = moment().subtract(refreshAfter, 'minutes');
    let cars  = allCars.filter((c) => {
      return !c.isAvailable || !c.updatedAt || moment(c.updatedAt).isBefore(stale);
    });

    // If cars exist but no updates are required, return

    if (allCars.length > 8 && cars.length === 0) {
      log.debug('Cars : Sync : No cars to be synced.');
      return;
    }

    // Retrieve all Active Devices from Invers and loop.

    log.debug(`Cars : Sync : retrieving device list from Cloudboxx.`);
    let devices = yield this.getDevices();
    log.debug(`Cars : Sync : ${ devices.length } devices available for sync.`);

    let syncList = devices.map(device => this.syncCar(device, cars, allCars));
    let result   = yield parallel(syncList);

    return yield Car.find();
  },

  /**
   * Attempts to sync a device with the local database.
   * @param  {String} device
   * @param  {Array}  cars
   * @param  {Array}  allCars
   * @return {Void}
   */
  *syncCar(device, cars, allCars) {
    try {
      let existingCar = cars.find(c => c.id === device.id);
      if (existingCar) {
        let updatedCar = yield this.getDevice(device.id);
        if (updatedCar) {
          log.debug(`Cars : Sync : updating ${ device.id }.`);
          yield this.syncUpdate(existingCar.id, updatedCar, existingCar);
        } else {
          log.debug(`Cars : Sync : failed to retrieve ${ device.id } to update database.`);
        }
      } else {
        // If Device does not match any Car then add it to the database.
        let excludedCar = allCars.find(c => c.id === device.id);
        if (!excludedCar) {
          let isMockCar = [ 'EE000017DC652701', 'C0000017DC247801' ].indexOf(device.id) > -1;
          if (!config.mock.cars && isMockCar) {
            // this is a dev kit, ignore update.
            log.debug(`Cars : Sync : skipping DevKit ${ device.id }.`);
          } else  {
            let newCar = yield this.getDevice(device.id);
            if (newCar) {
              let car = new Car(newCar);
              let meta = config.car.meta[car.id];
              if (meta) {
                car.license = meta.license;
              }
              log.debug(`Cars : Sync : adding ${ device.id }.`);
              yield car.upsert();
            } else {
              log.debug(`Cars : Sync : failed to retrieve ${ device.id } to add to database.`);
            }
          }
        } else {
          // If Device was found in database but not in our filtered list, ignore.
          log.debug(`Cars : Sync : skipping ${ device.id }.`);
        }
      }
    } catch(err) {
      log.warn(`Cars : Sync : ${ err.data.status } : ${ err.data.message } : ${ err.data.resource }`);
    }
  },

  /**
   * Returns a list of car devices from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  *getDevices(_user) {
    let devices = yield this.request('/devices?active=true&limit=100');
    if (devices) {
      return devices.data;
    }
    return null;
  },

  /**
   * Returns a single car device from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  *getDevice(id, _user) {
    try {
      let status = yield this.request(`/devices/${ id }/status`, { timeout : 30000 });
      this._errors[id] = 0;
      if (status) {

        status.id = id;
        status.t = new Date();
        /*
        if(status.fuel_level.toString() === '0') {
          yield notify.notifyAdmins(`0 charge reported. Full data retrieved: ${ JSON.stringify(status) }`, [ 'slack' ], { channel : '#api-errors' });
        }
        */
        fs.appendFileSync('/var/log/invers/log.txt', JSON.stringify(status) + "\n");

        return this.transformDeviceToCar(id, status);
      }
    } catch (err) {
      if (err.code === 'CAR_SERVICE_TIMEDOUT') {
        if (!this._errors[id]) this._errors[id] = 0;
        this._errors[id]++;
        let device = id;
        let car    = yield Car.findById(id);
        if (car) {
          device = car.license || id;
        }
        log.warn(`Cars : Sync : fetching device ${ id } failed, fleet request timed out.`);
        if (this._errors[id] === 4) {
          yield notify.notifyAdmins(`${ device } timed out on API status request from cloudboxx | ${ Bento.config.web.uri }/cars/${ device } | Contact cloudboxx to resolve.`, [ 'slack' ], { channel : '#api-errors' });
          this._errors[id] = 0;
        }
        return null;
      }
      throw err;
    }
  },

  /*
   |--------------------------------------------------------------------------------
   | Car Commands
   |--------------------------------------------------------------------------------
   |
   | A list of methods used to execute commands against a device/car.
   |
   */

  *unlockCar(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.UNLOCK_CAR }, _user);
    return yield this.executeCommand(id, 'central_lock', 'unlock', _user);
  },

  *lockCar(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.LOCK_CAR }, _user);
    return yield this.executeCommand(id, 'central_lock', 'lock', _user);
  },

  *unlockImmobilzer(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.UNIMMOBILIZE_CAR }, _user);
    return yield this.executeCommand(id, 'immobilizer', 'unlock', _user);
  },

  *lockImmobilzer(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.IMMOBILIZE_CAR }, _user);
    return yield this.executeCommand(id, 'immobilizer', 'lock', _user);
  },

  *lockAndImmobilze(id, _user) {
    let existingCar = yield Car.findById(id);
    if (!existingCar) {
      let error    = new Error(`CAR: ${ id }`);
      error.code   = 'CAR_SERVICE';
      error.status = 404;
      error.data   = 'NA';
      throw error;
    }

    let payload = changeCase.toSnake({
      centralLock : 'locked',
      immobilizer : 'locked'
    });
    let status = yield this.request(`/devices/${ id }/status`, {
      method : 'PATCH'
    }, payload);
    let updatedCar = this.transformDeviceToCar(id, status);
    if (_user) yield LogService.create({ carId : id, action : Actions.IMMOBILIZE_CAR }, _user);
    if (_user) yield LogService.create({ carId : id, action : Actions.LOCK_CAR }, _user);
    return yield this.syncUpdate(id, updatedCar, existingCar, _user);
  },

  /**
   * Execute a Command against a Device and update Car
   * @param  {String} id
   * @param  {String} part    central_lock || immobilizer
   * @param  {String} command lock || unlock
   * @param  {Object} _user
   * @return {Object} updated Car
   */
  *executeCommand(id, part, command, _user) {
    let existingCar = yield Car.findById(id);
    if (!existingCar) {
      let error    = new Error(`CAR: ${ id }`);
      error.code   = 'CAR_SERVICE';
      error.status = 404;
      error.data   = 'NA';
      throw error;
    }
    let payload    = {};
    payload[part]  = `${ command }ed`;
    let status     = yield this.request(`/devices/${ id }/status`, {
      method : 'PATCH'
    }, payload);
    let updatedCar = this.transformDeviceToCar(id, status);
    return yield this.syncUpdate(id, updatedCar, existingCar, _user);
  },

  /**
   * Events for a provided Car from Invers
   * @param  {String} id
   * @param  {Object} _user
   * @return {Array}        Array of Event Objects
   */
  *getEvents(id, _user) {
    let events = yield this.request(`/events?device=${ id }&timeout=0`);
    return events.data;
  },

  /**
   * Helper Function to transform an Invers Car object in to a Waivecar Car
   * @param  {String} id
   * @param  {Object} data Invers car object
   * @return {Object}      WaiveCar car model
   */
  transformDeviceToCar(id, data) {
    let car = {
      id                            : id,
      lockLastCommand               : data['central_lock_last_command'],
      isKeySecure                   : this.convertToBoolean(data, 'keyfob', { in : true, out : false }),
      bluetooth                     : data['bluetooth_connection'],
      alarmInput                    : data['alarm_input'],
      mileageSinceImmobilizerUnlock : data['mileage_since_immobilizer_unlock'],
      totalMileage                  : data['mileage'],
      boardVoltage                  : data['board_voltage'],
      charge                        : data['fuel_level'],
      isIgnitionOn                  : this.convertToBoolean(data, 'ignition', { on : true, off : false }),
      currentSpeed                  : data['speed'],
      isImmobilized                 : this.convertToBoolean(data, 'immobilizer', { locked : true, unlocked : false }),
      isLocked                      : this.convertToBoolean(data, 'central_lock', { locked : true, unlocked : false })
    };

    if (data['rfid_tag_states']) {
      let cards = data['rfid_tag_states'];
      car.isChargeCardSecure = this.convertToBoolean(cards, '1', { in : true, out : false });
    }

    if (data['position']) {
      let position = data['position'];
      if (position['lat']) {
        car.latitude  = position['lat'];
        car.longitude = position['lon'];
        car.distanceSinceLastRead = position['meters_driven_since_last_fix'];
        car.locationQuality       = position['quality'];
        car.calculatedSpeed       = position['speed_over_ground'];
        car.positionUpdatedAt     = position['timestamp'];
      }
    }

    if (data['electric_vehicle_state']) {
      let elec = data['electric_vehicle_state'];
      car.isCharging        = this.convertToBoolean(elec, 'charge', { on : true, off : false });
      car.isQuickCharging   = this.convertToBoolean(elec, 'quick_charge', { on : true, off : false });
      car.isOnChargeAdapter = this.convertToBoolean(elec, 'charge_adapter', { in : true, out : false });
      car.range             = elec['cruising_range'];
    }

    car.updatedAt = new Date();

    return car;
  },

  convertToBoolean(data, field, test) {
    let fieldValue = data[field];
    if (Object.keys(test).indexOf(fieldValue) > -1) {
      return test[fieldValue];
    } else {
      return false;
    }
  },

  /**
   * Returns the Response from a Request aginst the Invers API
   * @param  {String} resource uri endpoint of required resource
   * @param  {String} method   HTTP method
   * @param  {Object} data
   * @return {Object}          Response Object
   */
  *request(resource, options, data) {
    options = options || {};

    // ### Request Payload

    let payload = {
      url     : config.invers.uri + resource,
      method  : options.method || 'GET',
      headers : config.invers.headers,
      timeout : options.timeout || 60000
    };
    if (data) {
      payload.body = JSON.stringify(data);
    }

    // ### Submit Request

    try {
      let res = yield request(payload);
      if (res.statusCode !== 200) {
        let body = res.body ? JSON.parse(res.body) : null;
        throw error.parse({
          code    : 'CAR_SERVICE',
          message : 'An interaction attempt against the fleet service api failed.',
          data    : {
            status   : res.statusCode,
            message  : body ? body.error : null,
            resource : resource
          }
        }, 400);
      }
      return JSON.parse(res.body);
    } catch (err) {
      if (err.message === 'ETIMEDOUT') {
        throw error.parse({
          code    : 'CAR_SERVICE_TIMEDOUT',
          message : 'The interaction attempt against fleet service timed out.',
          data    : {
            target : resource
          }
        }, 400);
      }
      throw err;
    }
  }

};
