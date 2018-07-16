'use strict';

let _ = require('lodash');
let GeocodingService = require('./geocoding-service');

let request   = require('./request-cache-service');
let error     = Bento.Error;
let config    = Bento.config;
let cars      = require('./car-service');
let Car       = Bento.model('Car');


let Header = {
  Referer : config.api.uri,
  Accept  : 'application/json',
  Authorization: 'Token ' + config.evgo.token
};

module.exports = {
  *getVersions() {
    let url = 'https://op.evgo.com/externalIncoming/ocpi/cpo/2.1.1/versions';

    let reqResponse = yield request({
      url     : url,
      method  : 'GET',
      headers : Header
    });

    let versionUrlsArray = JSON.parse(reqResponse.body).data;

    let latestVersion = versionUrlsArray[versionUrlsArray.length - 1].url;

    let response = yield request({
      url     : latestVersion,
      method  : 'GET',
      headers : Header
    });

    return response.body;
  },

  *execRequest(what, params) {
    let versionsData = yield this.getVersions();
    let versions = JSON.parse(versionsData).data.endpoints;

    let execUrl = _.filter(versions, function (endpoint) {
      return endpoint.identifier === what;
    });

    if(execUrl) {
      return yield request({
        url     : execUrl[0],
        method  : 'GET',
        headers : Header
      });
    }
  },

  *getToken() {
    if(this.token) {
      return this.token;
    }
    let credentials = yield this.execRequest('credentials');

    if(credentials) { 
      this.token = credentials.data.token;
      this.credentials = credentials.data;
    }

    return this.token;
  },


  *authorize() {
    let versionsData = yield this.getVersions();
    let versions = JSON.parse(versionsData).data.endpoints;

    let credentialsUrl = _.filter(versions, function (endpoint) {
      return endpoint.identifier === 'credentials';
    })[0];

    let response = yield request({
       url: credentialsUrl.url,
       method: 'POST',
       headers: {
           Referer: config.api.uri,
           Accept: 'application/json'
       },
       body: JSON.stringify({
           token: 'test_token',
           country_code: "US",
           url: config.api.uri
       })
    });

    return response.body;
  },

  *list() {
    //mocked token
    let requestObj = this.prepareRequest('locations', 'GET');
    let response = yield request(requestObj);

    let result = JSON.parse(response.body);
    let locations = (result.data || []).map(loc => this.mapCharger(loc));
    return locations.filter( loc => GeocodingService.inDrivingZone(loc.latitude, loc.longitude));
  },

  *getCharger(id) {
    let requestObj = this.prepareRequest(`locations/${id}`, 'GET');
    let response = yield request(requestObj, {force: true});
    return JSON.parse(response.body);
  },

  prepareRequest(url, method) {
    return {
      url     : config.evgo.cpoUrl + url,
      method  : method,
      headers : Header
    }
  },

  mapCharger(loc) {
    let availableEvses = (loc.evses || []).filter((evse) => {return evse.status === 'AVAILABLE';});

    let newLoc = {
      id: 'charger_' + loc.id,
      address: loc.address,
      type: 'chargingStation',
      latitude: loc.coordinates.latitude,
      longitude: loc.coordinates.longitude,
      name: loc.name,
      status: availableEvses.length > 0 ? 'available' : 'unavailable'
    };

    if (newLoc.name === 'LAXN512DC1') {
      newLoc.address = 'test charger location';
      newLoc.latitude = 34.019907;
      newLoc.longitude = -118.468192;
    };

    return newLoc;
  },

  *startChargeSession(chargerId){
    let req = yield this.getCharger(chargerId);
    let charger = req.data;
    console.log(req);
    let availableEvses = (charger.evses || []).filter((evse) => {
      return evse.status.toLowerCase() === 'available';
    });

    let status = availableEvses.length > 0;

    if (!status) {
      throw  error.parse({
        code    : 'NO_EVSE_AVAILABLE',
        message : 'There is no available EVSE at the moment.'
      }, 400);
    }

    let evse = availableEvses[0];

    // we probably need a token to start the charge (see https://github.com/ocpi/ocpi/blob/master/releases/2.1.1/mod_commands.md#33-startsession-object)
    let startSession = {
      location_id: chargerId,
      evse_uid: evse.id
    };

    let startCommand = this.prepareRequest('commands/START_SESSION', 'POST');
    startCommand.body = JSON.stringify(startSession);
    let response = yield request(startCommand);
    return JSON.parse(response.body);
  },

  *stopChargeSession(chargerId){
    let charger = yield this.getCharger(chargerId);
    let startCommand = this.prepareRequest('commands/STOP_SESSION', 'POST');

  },

  *unlock(carId, chargerId) {
    let car = yield Car.findById(carId);
    let id = chargerId.replace('charger_', '');
    let data = yield this.startChargeSession(id);
    console.log(data);
    car.isCharging = data.response === 'ACCEPTED';
    //todo: send update status for charger and unlock available connector
    return yield cars.syncUpdate(carId, car);
  }
};
