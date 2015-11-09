'use strict';

let request        = require('co-request');
let Service        = require('./classes/service');
let queue          = Bento.provider('queue');
let queryParser    = Bento.provider('sequelize/helpers').query;
let User           = Bento.model('User');
let Car            = Bento.model('Car');
let error          = Bento.Error;
let relay          = Bento.Relay;
let config         = Bento.config.waivecar;

module.exports = class CarService extends Service {

  /**
   * Returns a list of cars from the local database.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *index(query, role, _user) {
    return yield Car.find(queryParser(query, {
      where : {
        userId : queryParser.NUMBER,
        status : queryParser.STRING
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
   * Returns the Response from a Request aginst the Invers API
   * @param  {String} resource uri endpoint of required resource
   * @param  {String} method   HTTP method
   * @param  {Object} data
   * @return {Object}          Response Object
   */
  static *request(resource, method, data) {
    let headers = config.invers.headers;
    let options = {
      url : config.invers.uri + resource,
      method : method || 'GET',
      headers : headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    let result   = yield request(options);
    let response = result.toJSON();
    if (!response || response.statusCode !== 200) {
      throw error.parse({
        code    : `CAR_SERIVCE`,
        message : `CAR: ${ resource }`,
        data    : JSON.parse(result.body)
      }, response.statusCode || 400);
    }

    return JSON.parse(response.body);
  }

  /**
   * Returns a list of car devices from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *listDevices(query, role, _user) {
    let devices = yield this.request('/devices?active=true&limit=100');
    return devices.data;
  }

  /**
   * Returns a single car device from Invers.
   * @param  {Object} query
   * @param  {String} role
   * @param  {Object} _user
   * @return {Array}
   */
  static *device(id, _user) {
    let status = yield this.request(`/devices/${ id }/status`);
    return this.buildCar(id, status);
  }

  /**
   * Execute a Command against a Car
   * @param  {String} id
   * @param  {String} command lock/unlock
   * @param  {Object} _user
   * @return {Object}         outcome of command
   */
  static *executeCommand(id, command, _user) {
    let car = yield Car.findById(id);
    if (!car) {
      let error    = new Error(`CAR: ${ id }`);
      error.code   = 'CAR_SERVICE';
      error.status = 404;
      error.data   = 'NA';
      throw error;
    }

    let status = yield this.request(`/devices/${ id }/status`, 'PATCH', {
      immobilizer  : `${ command }ed`,
      central_lock : `${ command }ed`
    });
    let updatedCar = this.buildCar(id, status);
    yield car.update(updatedCar);
    return updatedCar;
  }

  /**
   * Events for a provided Car from Invers
   * @param  {String} id
   * @param  {Object} _user
   * @return {Array}        Array of Event Objects
   */
  static *events(id, _user) {
    let events = yield this.request(`/events?device=${ id }&timeout=0`);
    return events.data;
  }

  /**
   * Helper Function to transform an Invers Car object in to a Waivecar Car
   * @param  {String} id
   * @param  {Object} data Invers car object
   * @return {Object}      WaiveCar car model
   */
  static buildCar(id, data) {
    let car = {
      id                            : id,
      lockLastCommand               : data['central_lock_last_command'],
      keyfob                        : data['keyfob'],
      bluetooth                     : data['bluetooth_connection'],
      alarmInput                    : data['alarm_input'],
      mileageSinceImmobilizerUnlock : data['mileage_since_immobilizer_unlock'],
      totalMileage                  : data['mileage'],
      boardVoltage                  : data['board_voltage'],
      charge                        : data['fuel_level'],
      ignition                      : data['ignition'],
      isImmobilized                 : this.convertToBoolean(data, 'immobilizer', { locked : true, unlocked : false }),
      isLocked                      : this.convertToBoolean(data, 'central_lock', { locked : true, unlocked : false })
    };

    if (data['position']) {
      let position = data['position'];
      car.latitude              = position['lat'];
      car.longitude             = position['lon'];
      car.distanceSinceLastRead = position['meters_driven_since_last_fix'];
      car.currentSpeed          = position['speed_over_ground'];
      car.updatedAt             = position['timestamp'];
    }

    if (data['electric_vehicle_state']) {
      let elec = data['electric_vehicle_state'];
      car.isCharging        = this.convertToBoolean(elec, 'charge', { on : true, off : false });
      car.isQuickCharging   = this.convertToBoolean(elec, 'quick_charge', { on : true, off : false });
      car.isOnChargeAdapter = this.convertToBoolean(elec, 'charge_adapter', { in : true, out : false });
      car.range             = elec['cruising_range'];
    }

    if (!car.updatedAt) {
      car.updatedAt = new Date();
    }

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

}
