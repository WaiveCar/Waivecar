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

  inDrivingZone(obj, magnitude = 1, reference) {
    reference = reference || config.waivecar.homebase.coords;
    /*
    if(obj.isA('car')) {
      if(yield obj.hasTag('csula')) {
      }
    } 
    */
    let distance = geolib.getDistance(obj, reference);
    let miles = distance * 0.000621371;
    return miles <= (25 * magnitude);
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

    console.log("trying to get " + lat + " " + long);
    try { 
      let res = yield request(`https://basic.waivecar.com/location.php?latitude=${lat}&longitude=${long}`);
      return res.body;
    } catch(ex) {
      console.log(ex);
      return null;
    }
  }
};
