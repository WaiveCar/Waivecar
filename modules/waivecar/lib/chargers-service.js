'use strict';

let _ = require('lodash');
let GeocodingService = require('./geocoding-service');

let request   = require('./request-cache-service');
let error     = Bento.Error;
let config    = Bento.config;
let cars      = require('./car-service');
let Car       = Bento.model('Car');

module.exports = {

  prepareRequest(url, method, opts) {
    method = method || 'GET';
    opts = opts || {};
    return {
      url     : (opts.url || config.evgo.cpoUrl) + url,
      method  : method,
      headers : {
        Accept  : 'application/json',
        Authorization: 'Token ' + config.evgo.token
      }
    };
  },

  *request(url, method, opts) {
    return yield request(this.prepareRequest(url, method), opts);
  },

  *getLocations() {
    let response = yield this.request('locations');
    try {
      return (JSON.parse(response.body)).data;
    } catch(ex) {
      return [];
    }
  },

  *list() {
    let locations = (yield this.getLocations()).map(loc => {
      let obj = {
        id: 'charger_' + loc.id,
        address: loc.address,
        type: 'chargingStation',
        latitude: loc.coordinates.latitude,
        longitude: loc.coordinates.longitude,
        name: loc.name,
        portList: []
      };
      loc.evses.forEach(evse => {
        let type = evse.connectors[0].standard;
        if(type === 'IEC_62196_T1_COMBO' || type === 'IEC_62196_T1') {
          obj.portList.push({
            type: type === 'IEC_62196_T1_COMBO' ? 'fast' : 'slow',
            name: evse.physical_reference,
            id: evse.uid
          });
        }
      });
      return obj;
    });

    return locations.filter( loc => GeocodingService.inDrivingZone(loc.latitude, loc.longitude));
  },

  *start(carId, chargerId) {
    /*
 curl --data '{"response_url":"http://9ol.es/charger-postback.php","token":{"uid":"049B53DA085280","type":"RFID","auth_id":"7e64ef7b-20cb-447c-92e0-253605c4edf7","visual_number":null,"issuer":"RFID Issuer","valid":true,"whitelist":"ALWAYS","language":null,"last_updated":"2018-08-15T03:09:32Z"},"location_id":"316","evse_uid":"366"}'  -X POST -vsH "Authorization: Token 7e64ef7b-20cb-447c-92e0-253605c4edf7" -H "Content-type: application/json" https://op.evgo.com/externalIncoming/ocpi/cpo/2.1.1/commands/START_SESSION
    */
    let body = {
      response_url: "http://9ol.es/charger-postback.php",
      token: {
        uid: "049B53DA085280",
        type: "RFID",
        auth_id: "7e64ef7b-20cb-447c-92e0-253605c4edf7",
        visual_number: null,
        issuer: "RFID Issuer",
        valid: true,
        whitelist: "ALWAYS",
        language: "null",
        last_updated: (new Date()).toISOString()
      },
      location_id: chargerId,
      evse_id: chargerId
    };


    let startCommand = this.prepareRequest('commands/START_SESSION', 'POST', {url: 'http://9ol.es:6501/'});
    startCommand.body = JSON.stringify(body);
    console.log(startCommand);
    let response = yield request(startCommand);
    console.log(response);
    return JSON.parse(response.body);
    /*
    car.isCharging = data.response === 'ACCEPTED';
    //todo: send update status for charger and unlock available connector
    return yield cars.syncUpdate(carId, car);
    */
  },
};
