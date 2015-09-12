'use strict';

let request    = require('co-request');
let _          = require('lodash');
let changeCase = Reach.Helpers.Case;
let config     = Reach.config.gm;

/* istanbul ignore next: extremely testing unfriendly */

module.exports = (function () {

  let GM_ASYNC_SUCCESS     = 'success';
  let GM_ASYNC_FAILURE     = 'failure';
  let GM_ASYNC_IN_PROGRESS = 'inProgress';
  let GM_ALERT_HONK        = 'Honk';
  let GM_ALERT_FLASH       = 'Flash';

  /**
   * @class VehicleService
   * @constructor
   */
  function VehicleService(){
    if (!config) {
      Reach.Logger.warn('GM API: VehicleService is missing config');
      return;
    }
    this._apiKey               = config.api.key;
    this._apiSecret            = config.api.secret;
    this._host                 = config.host;
    this._base64KeyAndSecret   = new Buffer(this._apiKey + ':' + this._apiSecret).toString('base64');
    this._bearerToken          = null;
    this._bearerExpiresIn      = null;
    this._bearerReceivedAt     = null;
    this._expiredLatency       = 5;
    this._asyncDelay           = 5000;
    this._defaultAlertDuration = 15;
  }

  /**
   * @method makeRequest
   * @param  {String} path
   * @param  {Object} options
   */
  VehicleService.prototype.makeRequest = function *(path, options) {
    var defaultHeaders = {
      'Accept':'application/json',
    };

    var defaultOptions = {
      url     : options.url || (this._host + path),
      headers : {
        Accept : 'application/json',
      },
      rejectUnauthorized : false
    };

    options = options ? _.merge(defaultOptions, options) : defaultHeaders;

    return yield request(options);
  };

  /**
   * @method makeAsyncRequest
   * @param  {String} path
   * @param  {Object} options
   */
  VehicleService.prototype.makeAsyncRequest = function *(path, options) {
    let result = yield this.makeRequest(path, options);
    var res    = result.toJSON();
    if (500 === res.statusCode) {
      let error    = new Error('GM API: VehicleService');
      error.code   = 'GM_API_VEHICLE_SERVICE';
      error.status = 400;
      error.data   = res;
      throw error;
    }
    let body = JSON.parse(result.body);
    return yield this.checkResponse(body.commandResponse, {
      headers : {
        Authorization : options.headers.Authorization
      }
    });
  };

  /**
   * @method checkResponse
   * @param  {Object} response
   * @param  {Object} options
   * @return {Mixed}
   */
  VehicleService.prototype.checkResponse = function *(response, options) {
    let self = this;

    if (GM_ASYNC_IN_PROGRESS === response.status) {
      yield function *(done) {
        setTimeout(done, self._asyncDelay);
      };
      options.url = response.url;
      return yield this.makeAsyncRequest(null, options);
    }

    if (GM_ASYNC_FAILURE === response.status) {
      return new Error(response);
    }

    if (GM_ASYNC_SUCCESS === response.status) {
      return response;
    }
  };

  /**
   * @method _setBearerToken
   * @param  {Object} tokenData
   */
  VehicleService.prototype._setBearerToken = function (tokenData) {
    this._bearerToken      = tokenData.access_token;
    this._bearerExpiresIn  = tokenData.expires_in - this._expiredLatency;
    this._bearerReceivedAt = new Date().getTime();
  };

  /**
   * @method getBearerToken
   */
  VehicleService.prototype.getBearerToken = function () {
    return this._bearerToken;
  };

  /**
   * @method isTokenExpired
   */
  VehicleService.prototype.isTokenExpired = function () {
    if(!this._bearerToken){
        return true;
    }
    var timeDiff = new Date().getTime() - this._bearerReceivedAt;
    return timeDiff / (1000*60) > this._bearerExpiresIn;
  };

  /**
   * @method connect
   */
  VehicleService.prototype.connect = function *() {
    if(!this.isTokenExpired()){
      return this.getBearerToken();
    }

    let options = {
      'headers' : {
        'Authorization' : 'Basic ' + this._base64KeyAndSecret
      }
    };

    let res  = yield this.makeRequest('oauth/access_token', options);
    let data = JSON.parse(res.body);

    this._setBearerToken(data);

    return this.getBearerToken();
  };

  /**
   * @method startEngine
   * @param  {String} vin
   */
  VehicleService.prototype.startEngine = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/start', {
      headers : {
        Authorization : 'Bearer ' + bearerToken
      },
      method : 'POST'
    });
    if ('success' === result.status) {
      return true;
    }
    return false;
  };

  /**
   * @method cancelStartEngine
   * @param  {String} vin
   */
  VehicleService.prototype.cancelStartEngine = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/cancelStart', {
      headers : {
        Authorization : 'Bearer ' + bearerToken
      },
      method : 'POST'
    });
    if ('success' === result.status) {
      return true;
    }
    return false;
  };

  /**
   * @method listVehicles
   */
  VehicleService.prototype.listVehicles = function *() {
    let bearerToken = yield this.connect();
    let result      = yield this.makeRequest('account/vehicles', {
      headers : {
        Authorization : 'Bearer ' + bearerToken
      }
    });

    let data = JSON.parse(result.body);

    // TODO: current location?

    if (data.vehicles && data.vehicles.vehicle) {
      return data.vehicles.vehicle;
    }
    return data;
  };

  /**
   * @method getVehicleDiagnostics
   * @param  {String} vin
   * @param  {Array}  diagnostItems List of diagnostics you want returned
   * @return {Object}
   */
  VehicleService.prototype.getVehicleDiagnostics = function *(vin, diagnostItems) {
    if (!diagnostItems) {
      diagnostItems = [
        'FUEL TANK INFO',
        // 'LAST TRIP DISTANCE',
        // 'LAST TRIP FUEL ECONOMY',
        // 'LIFETIME FUEL ECON',
        // 'LIFETIME FUEL USED',
        'ODOMETER',
        'OIL LIFE',
        'TIRE PRESSURE',
        'VEHICLE RANGE',
        'EV BATTERY LEVEL',
        'EV CHARGE STATE',
        'EV ESTIMATED CHARGE END'
      ];
    }

    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/diagnostics', {
      'headers':{
        'Authorization' : 'Bearer ' + bearerToken
      },
      method : 'POST',
      body   : JSON.stringify({
        'diagnosticsRequest': {
          'diagnosticItem' : diagnostItems
        }
      })
    });

    return parseDiagnosticResponse(result.body.diagnosticResponse, 'diagnosticElement');
  };

  /**
   * @private
   * @method parseDiagnosticResponse
   * @param  {Array}  response
   * @param  {String} elementName
   */
  function parseDiagnosticResponse(response, elementName) {
    let ret = {};
    response.forEach(function(item) {
      item = item[elementName];
      if (!item) { return; }
      if (Array === item.constructor) {
        item.forEach(function (item) {
          parseDiagnosticItem(item, ret);
        });
      } else {
        parseDiagnosticItem(item, ret);
      }
    });
    return ret;
  }

  /**
   * @private
   * @method parseDiagnosticItem
   * @param  {Object} item
   * @param  {Object} ret
   */
  function parseDiagnosticItem(item, ret) {
    let name = changeCase.toCamel(item.name);
    delete item.name;
    ret[name] = item;
  }

  /**
   * @method getVehicleLocation
   * @param  {String} vin
   * @return {Mixed}
   */
  VehicleService.prototype.getVehicleLocation = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/location', {
      'headers':{
        'Authorization' : 'Bearer ' + bearerToken
      },
      method : 'POST'
    });
    if (result.body && result.body.location) {
      return result.body.location;
    }
    return null;
  };

  /**
   * @method getVehicleInfo
   * @param  {String} vin
   */
  VehicleService.prototype.getVehicleInfo = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeRequest('account/vehicles/' + vin, {
      'headers':{
        'Authorization' : 'Bearer ' + bearerToken
      }
    });
    return JSON.parse(result.body);
  };

  /**
   * @method getVehicleCapabilities
   * @param  {String} vin
   */
  VehicleService.prototype.getVehicleCapabilities = function *(vin) {
    let result = yield this.makeRequest('vehicles/' + vin + '/capabilities', {
      'headers':{
        'Authorization' : 'Basic ' + this._base64KeyAndSecret
      }
    });
    return JSON.parse(result.body);
  };

  /**
   * @method unlockDoor
   * @param  {String} vin
   * @return {Boolean}
   */
  VehicleService.prototype.unlockDoor = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/unlockDoor', {
      headers : {
        Authorization  : 'Bearer ' + bearerToken,
        'content-type' : 'application/json'
      },
      method : 'POST',
      body   : JSON.stringify({
        unlockDoorRequest : {
          delay : 0
        }
      })
    });
    if ('success' === result.status) {
      return true;
    }
    return false;
  };

  /**
   * @method lockDoor
   * @param  {String} vin
   * @return {Boolean}
   */
  VehicleService.prototype.lockDoor = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/lockDoor', {
      headers : {
        Authorization  : 'Bearer ' + bearerToken,
        'content-type' : 'application/json'
      },
      method : 'POST',
      body   : JSON.stringify({
        lockDoorRequest : {
          delay : 0
        }
      })
    });
    if ('success' === result.status) {
      return true;
    }
    return false;
  };

  /**
   * @method _makeAlerts
   * @param  {String} vin
   * @param  {Int}    duration
   * @param  {Mixed}  action
   */
  VehicleService.prototype._makeAlerts = function *(vin, duration, action) {
    let bearerToken = yield this.connect();
    duration = duration || this._defaultAlertDuration;
    if (!Array.isArray(action)) {
      action = [action];
    }
    let override = [ 'DoorOpen', 'IgnitionOn' ];
    let result   = yield this.makeAsyncRequest('account/vehicles/' + vin + '/commands/alert', {
      headers : {
        'Authorization' : 'Bearer ' + bearerToken
      },
      method : 'POST',
      body   : JSON.stringify({
        alertRequest : {
          delay    : 0,
          duration : duration,
          action   : action,
          override : override
        }
      })
    });
    if ('success' === result.status) {
      return true;
    }
    return false;
  };

  /**
   * @method honk
   * @param  {String} vin
   * @param  {Int}    duration
   */
  VehicleService.prototype.honk = function *(vin, duration) {
      return yield this._makeAlerts(vin, duration, GM_ALERT_HONK);
  };

  /**
   * @method flash
   * @param  {String} vin
   * @param  {Int}    duration
   */
  VehicleService.prototype.flash = function *(vin, duration) {
      return yield this._makeAlerts(vin, duration, GM_ALERT_FLASH);
  };

  /**
   * @method honkAndFlash
   * @param  {String} vin
   * @param  {Int}    duration
   */
  VehicleService.prototype.honkAndFlash = function *(vin, duration) {
      return yield this._makeAlerts(vin, duration, [GM_ALERT_HONK,GM_ALERT_FLASH]);
  };

  /**
   * @method vehicleData
   * @param  {String} vin
   */
  VehicleService.prototype.vehicleData = function *(vin) {
    let bearerToken = yield this.connect();
    let result      = yield this.makeAsyncRequest('account/vehicles/' + vin + '/data/services', {
      headers : {
        Authorization  : 'Bearer ' + bearerToken,
        'content-type' : 'application/json'
      },
      method : 'POST',
      body   : JSON.stringify({
        dataServices : {
          dataService : [
            {
              serviceCode  : 'TELEMETRY',
              notification : {
                type : 'PUSH'
              }
            },
            {
              serviceCode : 'HARD_BRAKE'
            }
          ]
        }
      })
    });
    if ('success' === result.status) {
      return true;
    }
    return false;
  };

  return VehicleService;

})();