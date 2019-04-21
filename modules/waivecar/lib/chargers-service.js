'use strict';

let _ = require('lodash');
let GeocodingService = require('./geocoding-service');

let request   = require('./request-cache-service');
let error     = Bento.Error;
let config    = Bento.config;
let cars      = require('./car-service');
let Car       = Bento.model('Car');
let fs = require('fs');


module.exports = {

  prepareRequest(url, method, opts) {
    method = method || 'GET';
    opts = opts || {};
    return {
      url     : (opts.url || config.evgo.cpoUrl) + url,
      method  : method,
      headers : {
        'Content-type' : 'application/json',
        Authorization  : 'Token ' + config.evgo.token
      }
    };
  },

  *request(url, method, opts) {
    let response = yield request(this.prepareRequest(url, method), opts);
    //fs.appendFile('/var/log/outgoing/evgo.txt', JSON.stringify([url, response]) + "\n",function(){});
    return response;
  },

  *getLocations() {
    let response = [
      yield this.request('locations'),
      yield this.request('locations?offset=500')
    ];
    try {
      return Array.prototype.concat.apply([], response.map(row => JSON.parse(row.body).data));
    } catch(ex) {
      return [];
    }
  },

  *list(homebase) {
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

    return locations.filter( loc => loc.portList.length && GeocodingService.inDrivingZone(loc, 1.8, homebase));
  },

  *nameToUUID(name) {
    return (yield this.list()).reduce((res, row) => {
      if(res) { return res };

      let match = row.portList.filter(port => port.name === name.toUpperCase());

      if(match.length) {
        return match[0].id;
      }
    }, false);
  },

  *start(carId, chargerId) {
    let body = {
      response_url: "http://9ol.es/charger-postback.php",
      token: {
        uid: "049B53WAIVECAR",
        type: "RFID",
        auth_id: "7e64ef7b-20cb-447c-92e0-253605c4edf7",
        visual_number: null,
        issuer: "RFID Issuer",
        valid: true,
        whitelist: "ALWAYS",
        language: null,
        last_updated: (new Date()).toISOString().replace(/\.\d*Z/, 'Z')
      },
      location_id: chargerId,
      evse_uid: chargerId
    };


    let startCommand = this.prepareRequest('commands/START_SESSION', 'POST');//, {url: 'http://9ol.es:6501/'});
    startCommand.body = JSON.stringify(body);
    let response = yield request(startCommand);

    try {
      return JSON.parse(response.body);
    } catch(ex) { 
      return response.body; 
    }
  },
};
