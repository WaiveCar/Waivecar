'use strict';

let request = require('co-request');
let error = Bento.Error;
let config = Bento.config;
let geolib = require('geolib');

module.exports = {

  /**
   * Fetch reverse geoencoding
   */
  *show(query) {
    let lat = query.lat;
    let lon = query.lon;
    let url = `http://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&lat=${ lat }&lon=${ lon }`;

    if (!lat || !lon) {
      throw error.parse({
        code    : 'MISSING_PARAMETER',
        message : 'Must provide lat and lon.'
      }, 400);
    }

    let response = yield request({
      url     : url,
      method  : 'GET',
      headers : {
        Referer : config.api.uri,
        Accept  : 'application/json'
      }
    });

    return response.body;
  },

  // Check if provided lat / long is within 20 mile driving zone

  inDrivingZone(lat, long) {
    let distance = geolib.getDistance({ latitude : lat, longitude : long }, config.waivecar.homebase.coords);
    let miles = distance * 0.000621371;
    return miles <= 25;
  }
};
