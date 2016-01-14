'use strict';

let co          = require('co');
let parallel    = require('co-parallel');
let request     = require('co-request');
let moment      = require('moment');
let queue       = Bento.provider('queue');
let queryParser = Bento.provider('sequelize/helpers').query;
let User        = Bento.model('User');
let Car         = Bento.model('Car');
let changeCase  = Bento.Helpers.Case;
let error       = Bento.Error;
let relay       = Bento.Relay;
let config      = Bento.config.waivecar;
let log         = Bento.Log;
let Service     = require('./classes/service');

module.exports = class CarService extends Service {

  /**
   * Returns a list of cars from the local database.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, _user) {
    return yield Car.find(queryParser(query, {
      where : {
        id          : queryParser.STRING,
        userId      : queryParser.NUMBER,
        isAvailable : queryParser.BOOLEAN
      }
    }));
  }

  /**
   * Returns a car based on provided id from the local database.
   * @param  {Number} id
   * @param  {Object} _user
   * @return {Object}
   */
  static *show(id, _user) {
    return yield Car.findById(id);
  }

  /**
   * @param  {Number} id
   * @param  {Object}  payload
   * @param  {Object} _user
   * @return {Mixed}
   */
  static *update(id, payload, _user) {
    this.hasAccess(_user);

    let model  = yield Car.findById(id);
    let device = yield this.getDevice(car.id, _user);

    yield model.update(Object.assign(device, payload));

    relay.emit('cars', {
      type : 'update',
      data : model.toJSON()
    });

    return model;
  }

  /**
   * @param  {Number} id
   * @param  {Boolean}  isAvailable
   * @param  {Object} _user
   * @return {Mixed}
   */
  static *updateAvailability(id, isAvailable, _user) {
    this.hasAccess(_user);
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

    return model;
  }

  /**
   * A convenience method to update the local Car (to enable pre-save model transformations)
   * @param  {Number} id          car Id
   * @param  {Object} data        update data to persist
   * @param  {Object} existingCar existing Car to update (optional)
   * @param  {Object} _user       user (optional)
   * @return {Object}             updated Car
   */
  static *syncUpdate(id, data, existingCar, _user) {
    if (!existingCar) {
      existingCar = yield Car.findById(id);
    }

    if (!existingCar.license) {
      let meta = config.car.meta[existingCar.id];
      if (meta) {
        data.license = meta.license;
      }
    }

    // Is car stationary?
    if (data.currentSpeed === 0) { // data.distanceSinceLastRead === 0) {

      // If the distance last read was also 0, the car is STILL stopped so dont treat this update as an update.
      if (existingCar.distanceSinceLastRead === 0) {
        delete data.positionUpdatedAt;
      }

      // Only update position if its more accurate
      // if (existingCar.locationQuality >= data.locationQuality) {
      //   delete data.locationQuality;
      //   delete data.latitude;
      //   delete data.longitude;
      //   delete data.calculatedSpeed;
      // }

      data.isParked = (data.currentSpeed === 0) && (!data.isIgnitionOn);
    }

    yield existingCar.update(data);

    // Alerts
    // yield Notifications.sendToAdmins('car');

    // Relay update to connected clients
    relay.emit('cars', {
      type : 'update',
      data : existingCar.toJSON()
    });

    return existingCar;
  }

  static *refresh(deviceId) {
    let updatedCar = yield this.getDevice(deviceId);
    if (updatedCar) {
      log.debug(`Cars : Refresh : updating ${ deviceId }.`);
      yield this.syncUpdate(deviceId, updatedCar);
    } else {
      log.debug(`Cars : Refresh : failed to retrieve ${ deviceId } to update database.`);
    }
  }

  static *syncCar(device, cars, allCars) {
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
  }

  /**
   * [syncCars description]
   * @param  {Integer}  refreshAfter How many minutes can a Car go without being resynced (defaults to 15).
   * @return {Array}    all cars.
   */
  static *syncCars() {
    log.debug('CarService : syncCars : start');
    let refreshAfter = config.car.staleLimit || 15;

    // Retrieve all local cars.
    let allCars = yield Car.find();

    // Filter cars to include either:
    // 1. car is currently in a booking (i.e. not available), or
    // 2. car has never been updated, or
    // 3. car has not been updated for more than [refreshAfter] minutes.
    let stale = moment().subtract(refreshAfter, 'minutes');
    let cars = allCars.filter((c) => {
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

    let syncs = devices.map(device => this.syncCar(device, cars, allCars));
    let result = yield parallel(syncs, 20);

    return yield Car.find();
  }


  /**
   * Returns a list of car devices from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *getDevices(_user) {
    let devices = yield this.request('/devices?active=true&limit=100');
    if (devices) {
      return devices.data;
    }

    return null;
  }

  /**
   * Returns a single car device from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *getDevice(id, _user) {
    let status = yield this.request(`/devices/${ id }/status`, { timeout : 10000 });
    if (status) {
      return this.transformDeviceToCar(id, status);
    }
    return null;
  }

  /**
   * Execute a Command against a Device and update Car
   * @param  {String} id
   * @param  {String} command lock/unlock
   * @param  {Object} _user
   * @return {Object} updated Car
   */
  static *unlockCar(id, _user) {
    return yield this.executeCommand(id, 'central_lock', 'unlock', _user);
  }

  static *lockCar(id, _user) {
    return yield this.executeCommand(id, 'central_lock', 'lock', _user);
  }

  static *unlockImmobilzer(id, _user) {
    return yield this.executeCommand(id, 'immobilizer', 'unlock', _user);
  }

  static *lockImmobilzer(id, _user) {
    return yield this.executeCommand(id, 'immobilizer', 'lock', _user);
  }

  static *lockAndImmobilze(id, _user) {
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
    let status = yield this.request(`/devices/${ id }/status`, 'PATCH', payload);
    let updatedCar = this.transformDeviceToCar(id, status);
    return yield this.syncUpdate(id, updatedCar, existingCar, _user);
  }

  /**
   * Execute a Command against a Device and update Car
   * @param  {String} id
   * @param  {String} part    central_lock || immobilizer
   * @param  {String} command lock || unlock
   * @param  {Object} _user
   * @return {Object} updated Car
   */
  static *executeCommand(id, part, command, _user) {
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
    let status     = yield this.request(`/devices/${ id }/status`, 'PATCH', payload);
    let updatedCar = this.transformDeviceToCar(id, status);
    return yield this.syncUpdate(id, updatedCar, existingCar, _user);
  }

  /**
   * Events for a provided Car from Invers
   * @param  {String} id
   * @param  {Object} _user
   * @return {Array}        Array of Event Objects
   */
  static *getEvents(id, _user) {
    let events = yield this.request(`/events?device=${ id }&timeout=0`);
    return events.data;
  }

  /**
   * Helper Function to transform an Invers Car object in to a Waivecar Car
   * @param  {String} id
   * @param  {Object} data Invers car object
   * @return {Object}      WaiveCar car model
   */
  static transformDeviceToCar(id, data) {
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
  }

  static convertToBoolean(data, field, test) {
    let fieldValue = data[field];
    if (Object.keys(test).indexOf(fieldValue) > -1) {
      return test[fieldValue];
    } else {
      return false;
    }
  }

  /**
   * Returns the Response from a Request aginst the Invers API
   * @param  {String} resource uri endpoint of required resource
   * @param  {String} method   HTTP method
   * @param  {Object} data
   * @return {Object}          Response Object
   */
  static *request(resource, options, data) {
    options = options || {};
    if (typeof options === 'string') {
      options = {
        method : options
      };
    }

    let baseOptions = {
      url     : config.invers.uri + resource,
      method  : options.method || 'GET',
      headers : config.invers.headers,
      timeout : options.timeout || 600000
    };

    if (data) {
      baseOptions.body = JSON.stringify(data);
    }

    try {
      let result   = yield request(baseOptions);
      let response = result.toJSON();
      let statusCode = response ? response.statusCode : 400;
      if (statusCode !== 200) {
        log.error(error.parse({
          code    : `CAR_SERVICE`,
          message : `CAR: ${ resource }`,
          data    : response.body ? JSON.parse(response.body) : response
        }, statusCode));
        return null;
      }

      return JSON.parse(response.body);
    } catch(err) {
        log.error(error.parse({
          code    : `CAR_SERVICE`,
          message : `CAR: ${ resource } - ${ err.message }`,
          data    : { error : err.message },
          stack   : err.stack
        }, 503));
        return null;
    }
  }

  /**
   * Only allow access if the requesting user is the administrator.
   * @param  {Object}  user  The user to be modified.
   * @param  {Object}  _user The user requesting modification.
   * @return {Boolean}
   */
  static hasAccess(user) {
    if (!user.hasAccess('admin')) {
      throw error.parse({
        error   : `INVALID_PRIVILEGES`,
        message : `You do not have the required privileges to perform this operation.`
      }, 403);
    }
  }

};
