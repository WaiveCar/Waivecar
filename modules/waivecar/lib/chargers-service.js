'use strict';

let request = require('./request-cache-service');
let error = Bento.Error;
let config = Bento.config;
let _ = require('lodash');
let GeocodingService = require('./geocoding-service');
let cars      = require('./car-service');
let Car       = Bento.model('Car');



module.exports = {
  *getVersions() {
    let url = 'https://evgotest.driivz.com/externalIncoming/ocpi/cpo/versions';

    let reqResponse = yield request({
      url     : url,
      method  : 'GET',
      headers : {
        Referer : config.api.uri,
        Accept  : 'application/json',
        Authorization: 'Token ' + config.evgo.token
      }
    });

    let versionUrlsArray = JSON.parse(reqResponse.body).data;

    let latestVersion = versionUrlsArray[versionUrlsArray.length - 1].url;

    let response = yield request({
        url     : latestVersion,
        method  : 'GET',
        headers : {
            Referer : config.api.uri,
            Accept  : 'application/json',
            Authorization: 'Token ' + config.evgo.token
        }
    });

    return response.body;
  },

  *authorize() {
    let versionsData = yield this.getVersions();
    let versions = JSON.parse(versionsData).data.endpoints;


    let credentialsUrl = _.filter(versions, function (endpoint) {
        return  endpoint.identifier === 'credentials';
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
      let response = yield request(requestObj);
      return JSON.parse(response.body).data;
  },

  prepareRequest(url, method) {
    return {
      url     : config.evgo.cpoUrl + url,
      method  : method,
      headers : {
        Referer : config.api.uri,
        Accept  : 'application/json',
        Authorization: 'Token ' + config.evgo.token
      }
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
          newLoc.latitude = 34.0199;
          newLoc.longitude = -118.48908000;
      };

      return newLoc;
  },

  *startChargeSession(chargerId){
      let charger = yield this.getCharger(chargerId);
      let availableEvses = (charger.evses || []).filter((evse) => {return evse.status === 'AVAILABLE';});

      let status = availableEvses.length > 0;

      if (!status) {
          throw  error.parse({
              code    : 'NO_EVSE_AVAILABLE',
              message : 'There is no available EVSE at the moment.'
          }, 400);
      }

      let evse = availableEvses[0];

      let startSession = {
          location_id: chargerId,
          evse_uid: evse.id
      };

      let startCommand = this.prepareRequest('commands/START_SESSION', 'POST');
      startCommand.body = JSON.stringify(startSession);
      let response = yield request(startCommand);
      return JSON.parse(response.body).data;
  },

  *stopChargeSession(chargerId){

  },

  *unlock(carId, chargerId) {
      let car = yield Car.findById(carId);
      let id = chargerId.replace('charger_', '');
      let response = yield this.startChargeSession(id);
      car.isCharging = response  === 'ACCEPTED';
      //todo: send update status for charger and unlock available connector
      return yield cars.syncUpdate(carId, car);
  }
};
