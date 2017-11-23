'use strict';

let sequelize = Bento.provider('sequelize');
let co          = require('co');
let parallel    = require('co-parallel');
let request     = require('co-request');
let moment      = require('moment');
let notify      = require('./notification-service');
let Service     = require('./classes/service');
let LogService  = require('./log-service');
let redis       = require('./redis-service');
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
let carMap = false;

module.exports = {

  // Track api errors to notify admins
  _errors : {},

  // people only really care about licenses ... so this 
  // helps convert things over in some non-braindead way.
  *id2license(id) {
    // we *cache* things
    if(!carMap) {
      carMap = {};
      (yield Car.find()).forEach((car) => {
        // create a two way map
        carMap[car.id] = car.license;
        carMap[car.license] = car.id;
      });
    }
    if(!arguments.length) { 
      return carMap;
    }
    return carMap[id];
  },

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

    options.where.inRepair = false;
    if (_user && !_user.hasAccess('admin')) {
      options.where.adminOnly = false;
    }

    options.limit = 100;
    let cars = yield Car.find(options);
    let bookings = yield Booking.find({ where : { status : 'started' } });

    this.joinCarsWithBookings(cars, bookings);

    let available = 0;
    cars.forEach(function(car) {
      car.license = car.license || '';
      available += car.isAvailable;
    });

    if (_user && !_user.hasAccess('admin')) {
      fs.appendFileSync('/var/log/outgoing/carsrequest.txt', JSON.stringify([new Date(), available, _user.id]) + '\n');
    }
    return cars;
  },

  joinCarsWithBookings(cars, bookings) {

    var cardIdToBookingIdMap = {};

    bookings.forEach(function(booking) {
      cardIdToBookingIdMap[booking.carId] = booking.id;
    });

    cars.forEach(function(car) {
      var bookingId = cardIdToBookingIdMap[car.id];
      if (bookingId) {
        car.bookingId = bookingId;
      }
    });

  },

  /**
   * Returns a list of cars with bookings from the local database.
   * @param  {Object} _user
   * @return {Array}
   */
  *carsWithBookings() {
    let cars = yield Car.find({
      include: [
        { 
          model : 'User',
          as: 'user'
        },
        { 
          model : 'Booking',
          as: 'booking',
          order: [['created_at', 'DESC']],
          limit: 1
        }
      ]
    });

    // the schema as of this writing is
    // enum('reserved','pending','cancelled','ready','started','ended','completed','closed') 
    let statusMap = {
      cancelled: 'Available',
      closed:    'Available',
      completed: 'Available',
      ended:     'Available',
      pending:   'Reserved',
      ready:     'Active',
      reserved:  'Reserved',
      started:   'Active',
    };

    cars.forEach(function(car){
      car.license = car.license || '';
      if(car.booking && car.booking[0]) {
        car.statuscolumn = statusMap[car.booking[0].status] || 'Unavailable';
      } else { 
        car.statuscolumn = 'Unavailable';
      }

      if(car.statuscolumn === 'Available') {
        car.statuscolumn = car.isAvailable ? 'Available' : 'Unavailable';
      }
    });

    return cars;
  },

  *find(query) {
    let parts = query.split(' ');

    return yield Car.find({
      where: { $or: 
        parts.map((term) => {
          return { license : { $like : `%${ term }%` } };
        })
      }
    });
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
    let start = +new Date();
    let car = yield Car.findById(id, {
      include : [
        {
          model : 'User',
          as    : 'user'
        }
      ]
    });

    return car;
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
        code    : 'CAR_SERVICE_NOT_FOUND',
        message : 'The car has not been registered in our database.',
        data    : {
          id : id
        }
      }, 404);
    }
    let device = yield this.getDevice(car.id, _user, 'update');

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

  *updateRepair(id, _user) {
    access.verifyAdmin(_user);
    let model = yield Car.findById(id);

    yield model.update({inRepair: !model.inRepair});

    // we trick the relay into hiding cars that are set
    // to repair for legacy versions of the app so that
    // they don't magically appear.
    var obj = model.toJSON();
    if(model.inRepair) {
      obj.isAvailable = false;
    }

    relay.emit('cars', {
      type : 'update',
      data : obj
    });

    return model;
  },

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
    let updatedCar = yield this.getDevice(deviceId, null, 'refresh');
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

    // We only store the charges if things are non-zero 
    // (see https://github.com/clevertech/Waivecar/issues/629)
    //
    // And by zero we are also considering all bottom values, as one
    // user got some other non-integer bottom values.
    if (data.charge) {
      // see https://github.com/WaiveCar/Waivecar/issues/727 ... Waive2 and 20 is off by 35 
      if (['WAIVE20', 'WAIVE2'].indexOf(existingCar.license) !== -1) {
        // we lob off some amount
        data.charge -= 30;
        // and make sure it's over 0.
        data.charge = Math.max(0, data.charge);
      }

      // We notify fleet if the car passes a threshold to make
      // sure that they put the car out.
      // see https://github.com/WaiveCar/Waivecar/issues/857
      if(data.isCharging && !existingCar.isAvailable && !(yield redis.shouldProcess('car-charge-notice', existingCar.id))) {
        if( 
            (data.charge >= 100 && existingCar.charge < 100) ||
            (data.charge >= 80 && existingCar.charge < 80)
          ) {
          yield notify.notifyAdmins(`:car: ${ existingCar.license } has charged to ${ data.charge }% and should be made available.`, [ 'slack' ], { channel : '#rental-alerts' });
        }
      }

      existingCar.addToHistory(data.charge);
      data.chargeHistory = existingCar.chargeHistory;
    }

    if (data.boardVoltage < 10.5 && data.isIgnitionOn) {
      yield notify.notifyAdmins(`:skull: ${ existingCar.license } board voltage is at ${ data.boardVoltage }v`, [ 'slack' ], { channel : '#rental-alerts' });
    }

    // We find out if our charging status has changed
    if (('charging' in data) && (data.isCharging != existingCar.isCharging)) {
      yield LogService.create({carId: id, action: data.isCharging ? Actions.START_CHARGE : Actions.END_CHARGE});
    }

    yield existingCar.update(data);

    relay.emit('cars', {
      type: 'update',
      data: existingCar.toJSON()
    });

    if (data.isIgnitionOn || existingCar.mileage !== data.mileage || data.calculatedSpeed > 0 || data.currentSpeed > 0 || !data.isParked) {
      let booking = yield Booking.findOne({where: {status: 'started', carId: existingCar.id}});
      if ( booking && !booking.isFlagged('drove') ) {
        yield booking.flag('drove');
        yield booking.delForfeitureTimers();
      }
    }


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
    let devices = yield this.getAllDevices();
    log.debug(`Cars : Sync : ${ devices.length } devices available for sync.`);

    let syncList = devices.map(device => this.syncCar(device, cars, allCars));
    let result   = yield parallel(syncList);

    return yield Car.find();
  },

  // Note that the carList and the allCars are not model links
  // but actual arrays of results. SMH
  *syncCar(device, carList, allCars) {
    try {
      let existingCar = carList.find(c => c.id === device.id);
      if (existingCar) {
        let updatedCar = yield this.getDevice(device.id, null, 'sync');
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
              } else {
                let nextNumber =  allCars.length;
                let candidateName = '';
                do {
                  candidateName = `WAIVE${ nextNumber }`;
                  existingCar = carList.find(c => c.license === candidateName);
                  nextNumber ++;
                } while(existingCar);

                car.license = candidateName;
              }
              car.licenseUsed = car.license;
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
      if(err.data) {
        log.warn(`Cars : Sync : ${ err.data.status } : ${ err.data.message } : ${ err.data.resource }`);
      } else {
        log.warn(`Cars : Sync : ${ err }`);
      }
    }
  },

  /**
   * Returns a list of car devices from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  *getAllDevices(_user) {
    let devices = yield this.request('/devices?active=true&limit=100');
    if (devices) {
      return devices.data;
    }
    return null;
  },

  logStatus(status, id, misc) {
    status.id = id;
    status.t = new Date();
    status._misc = misc;
    fs.appendFileSync('/var/log/invers/log.txt', JSON.stringify(status) + "\n");
  },

  /**
   * Returns a single car device from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  *getDevice(id, _user, source) {
    if (process.env.NODE_ENV !== 'production') {
      return false;
    }
    try {
      let status = yield this.request(`/devices/${ id }/status`, { timeout : 30000 });
      this._errors[id] = 0;
      if (status) {

        this.logStatus(status, id, source);

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

  *ble(id, _user) {
    let car = yield Car.findById(id);
    
    if (!_user.isAdmin() && car.userId !== _user.id) {
      return error.parse({
        code    : 'CAR_SERVICE',
        message : 'You do not have access to that car'
      });
    }

    let now = new Date();
    let expire = new Date(+now + 3600 * 1000);

    let status = yield this.request(`/bluetooth-token/${ id }`, {
      method : 'POST'
    }, {
      level: "Drive",
      from: now.toISOString(),
      until: expire.toISOString()
    });

    return status;
  },

  *horn(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.UNLOCK_CAR }, _user);
    return yield this.executeCommand(id, 'horn', 'on', _user);
  },

  *unlockCar(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.UNLOCK_CAR }, _user);
    return yield this.executeCommand(id, 'central_lock', 'unlock', _user);
  },

  *lockCar(id, _user) {
    if (_user) yield LogService.create({ carId : id, action : Actions.LOCK_CAR }, _user);
    return yield this.executeCommand(id, 'central_lock', 'lock', _user);
  },

  *openDoor(id, _user){
    if (_user) yield LogService.create({ carId : id, action : Actions.OPEN_DOOR_CAR }, _user);
    let car = yield Car.findById(id);
    return yield car.openDoor();
  },

  *closeDoor(id, _user){
    if (_user) yield LogService.create({ carId : id, action : Actions.CLOSE_DOOR_CAR }, _user);
    let car = yield Car.findById(id);
    return yield car.closeDoor();
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
    let updatedCar = false;
    if (!existingCar) {
      let error    = new Error(`CAR: ${ id }`);
      error.code   = 'CAR_SERVICE';
      error.status = 404;
      error.data   = 'NA';
      throw error;
    }
    let payload    = {};
    payload[part]  = `${ command }ed`;
    //
    // We only touch cars if we are in production. See
    // https://github.com/WaiveCar/Waivecar/issues/739
    //
    if (process.env.NODE_ENV === 'production') {
      let status     = yield this.request(`/devices/${ id }/status`, {
        method : 'PATCH'
      }, payload);
      this.logStatus(status, id, payload);
      updatedCar = this.transformDeviceToCar(id, status);
    } else {
      updatedCar = existingCar;
      if(part === 'central_lock') {
        if(command === 'unlock') { updatedCar.isLocked = false; }
        if(command === 'lock')   { updatedCar.isLocked = true; }
      }
      if(part === 'immobilizer') {
        if(command === 'unlock') { updatedCar.isImmobilized = false; }
        if(command === 'lock')   { updatedCar.isImmobilized = true; }
      }
    }
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

    // if we don't have a fuel level, we default to 89 ... this should
    // be eventually removed 
    if (! ('fuel_level' in data) ) {
      data['fuel_level'] = 89;
    }
    if (! ('keyfob' in data) ) {
      data['keyfob'] = 'in';
    }

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
      isLocked                      : this.convertToBoolean(data, 'central_lock', { locked : true, unlocked : false }),
      isDoorOpen                    : this.convertToBoolean(data, 'doors', { open : true, closed : false }),
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
