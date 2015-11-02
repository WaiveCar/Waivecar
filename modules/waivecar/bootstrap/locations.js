'use strict';

let fs       = require('co-fs');
let path     = require('path');
let Location = Bento.model('Location');
let error    = Bento.Error;
let log      = Bento.Log;

module.exports = function *() {
  let count = yield Location.count();
  if (count > 140) {
    return;
  }

  let data     = null;
  let filePath = path.resolve('./data/charging-stations-la.json');
  try {
    data = JSON.parse(yield fs.readFile(filePath));
  } catch (err) {
    error.check(err, [ 'ENOENT' ], filePath);
  }

  // ### Import Location
  // If location data has been defined we import all locations.

  if (data) {
    log.debug(`Importing ${ data.length } locations`);
    for (let i = 0, len = data.length; i < len; i++) {
      let model = data[i];
      if (model.latitude && model.longitude) {
        let location = new Location({
          type        : 'station',
          name        : model['station_name'],
          description : model['station_phone'],
          latitude    : model.latitude,
          longitude   : model.longitude,
          address     : [ model['street_address'], model.city, model.state, model.zip ].join(', ')
        });
        yield location.upsert();
      }
    }
  }
};