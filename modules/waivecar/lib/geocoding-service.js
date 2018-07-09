'use strict';

let request = require('co-request');
let error = Bento.Error;
let config = Bento.config;
let geolib = require('geolib');

module.exports = {

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
  },

  hasMoved(location1, location2, threshold) {
    threshold = threshold || 250;
    let distance = geolib.getDistance(
      { latitude : location1.latitude, longitude : location1.longitude },
      { latitude : location2.latitude, longitude : location2.longitude }
    );
    return distance >= threshold ? distance : 0;
  },

  *getAddressComponent(lat, lng, type) {
    let list = yield this.getAddress(lat, lng, 'address_components');
    for(var ix = 0; ix < list.length; ix++) {
      if (list[ix].type.includes(type)) {
        return list[ix];
      }
    }
  },

  *getAddress(lat, long, param) {
    try { 
      let res = yield request(`http://maps.googleapis.com/maps/api/geocode/json`, {
        qs : {
          latlng : `${ lat },${ long }`
        }
      });
      let body = JSON.parse(res.body);
      param = param || 'formatted_address';
      return body.results.length ? body.results[0][param] : null;
    } catch(ex) {
      return null;
    }
  }
};
