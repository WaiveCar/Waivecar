'use strict';

let fs       = require('co-fs');
let path     = require('path');
let Location = Bento.model('Location');
let error    = Bento.Error;
let log      = Bento.Log;
let config   = Bento.config.waivecar;

module.exports = function *() {
  if (!config.mock.stations) {
    return;
  }

  let count = yield Location.count();
  if (count > 10) {
    return;
  }

  // let locations = yield fs.readFile(path.join(Bento.ROOT_PATH, 'modules', 'waivecar', 'bootstrap', 'data', 'charging-stations-la.json'));
  // let data      = JSON.parse(locations);

  // // ### Import Location
  // // If location data has been defined we import all locations.
  // if (data) {
  //   log.debug(`Importing ${ data.length } locations`);
  //   for (let i = 0, len = data.length; i < len; i++) {
  //     let model = data[i];
  //     if (model.latitude && model.longitude) {
  //       let location = new Location({
  //         type        : 'station',
  //         name        : model['station_name'],
  //         description : model['station_phone'],
  //         latitude    : model.latitude,
  //         longitude   : model.longitude,
  //         address     : [ model['street_address'], model.city, model.state, model.zip ].join(', ')
  //       });
  //       yield location.upsert();
  //     }
  //   }
  // }

  let locations = yield fs.readFile(path.join(Bento.ROOT_PATH, 'modules', 'waivecar', 'bootstrap', 'data', 'charging-stations-santa-monica.json'));
  let data      = JSON.parse(locations);

  // ### Import Location
  // If location data has been defined we import all locations.
  if (data) {
    data = data.data;
    log.debug(`Importing ${ data.length } locations`);
    for (let i = 0, len = data.length; i < len; i++) {
      let model = data[i];
      let position = model[8];
      let address = JSON.parse(position[0]);
      let location = new Location({
        type        : 'station',
        name        : model[9],
        description : `${ model[10] } charger(s)`,
        latitude    : position[1],
        longitude   : position[2],
        address     : [ address.address, address.city, address.state, address.zip ].join(', ')
      });
      yield location.upsert();
    }
  }


};
