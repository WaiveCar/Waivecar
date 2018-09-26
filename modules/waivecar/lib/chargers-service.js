'use strict';

let _ = require('lodash');
let GeocodingService = require('./geocoding-service');

let request   = require('./request-cache-service');
let error     = Bento.Error;
let config    = Bento.config;
let cars      = require('./car-service');
let Car       = Bento.model('Car');

module.exports = {
  *request(url, method, opts) {
    method = method || 'GET';
    return yield request({
      url     : config.evgo.cpoUrl + url,
      method  : method,
      headers : {
        Referer : config.api.uri,
        Accept  : 'application/json',
        Authorization: 'Token ' + config.evgo.token
      }
    }, opts);
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
            id: evse.uid
          });
        }
      });
      return obj;
    });

    return locations.filter( loc => GeocodingService.inDrivingZone(loc.latitude, loc.longitude));
  },

  *getCharger(id) {
    let locations = (yield this.getLocations()).filter(row => row.id == 'id');
    return locations.length ? locations : false;
  },


  *startChargeSession(chargerId){
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
        last_updated: "" + new Date()
      },
      location_id: chargerId,
      evse_id: chargerId
    };


    /*
    let startCommand = this.prepareRequest('commands/START_SESSION', 'POST');
    startCommand.body = JSON.stringify(startSession);
    let response = yield request(startCommand);
    return JSON.parse(response.body);
    */
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
