'use strict';

let request = require('co-request');
let error = Bento.Error;
let config = Bento.config;
let _ = require('lodash');
let GeocodingService = require('./geocoding-service');
let cars      = require('./car-service');
let Car       = Bento.model('Car');



module.exports = {

    /**
     * Fetch api versions
     * */
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
        let response = yield request({
            url     : 'https://evgotest.driivz.com/externalIncoming/ocpi/cpo/2.1.1/locations',
            method  : 'GET',
            headers : {
                Referer : config.api.uri,
                Accept  : 'application/json',
                Authorization: 'Token dsakjrh3447sdfgs32985sd'
            }
        });

        let result = JSON.parse(response.body);
        let locations = (result.data || []).map(loc => this.mapCharger(loc));
        return locations.filter( loc => GeocodingService.inDrivingZone(loc.latitude, loc.longitude));
    },

    *getCharger(id) {
        let response = yield request({
            url     : `https://evgotest.driivz.com/externalIncoming/ocpi/cpo/2.1.1/locations/${id.replace('charger_', '')}`,
            method  : 'GET',
            headers : {
                Referer : config.api.uri,
                Accept  : 'application/json',
                Authorization: 'Token dsakjrh3447sdfgs32985sd'
            }
        });
        return this.mapCharger(JSON.parse(response.body).data);
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

        if (newLoc.name === 'LAXT294DC1') {
            newLoc.address = 'test charger location';
            newLoc.latitude = 34.0199;
            newLoc.longitude = -118.48908000;
        };

        return newLoc;
    },

    *unlock(carId, chargerId) {
        let car = yield Car.findById(carId);
        let charger = yield this.getCharger(chargerId);
        console.log(charger);

        //send update status for charger and unlock available connector

        car.isCharging = true;
        return yield cars.syncUpdate(carId, car);
    }
};
