'use strict';

let request = require('co-request');
let error = Bento.Error;

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
        Referer : 'https://waivecar.com',
        Accept  : 'application/json'
      }
    });

    return response.body;
  }
};
