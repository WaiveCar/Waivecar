'use strict';

let fs       = require('co-fs');
let path     = require('path');
let _        = require('lodash');
let log      = Reach.Log;
let query    = Reach.service('mysql/query');
let Location = Reach.model('Location');

module.exports = function *() {

  let count = yield query.count('locations');
  if (count > 1) {
    return;
  }

  let filePath = path.join(Reach.ROOT_PATH, 'modules', 'waivecar', 'bootstrap', 'data', 'charging-stations-sf.json');
  if (yield fs.exists(filePath)) {
    let data = JSON.parse(yield fs.readFile(filePath));

    if (data) {
      log.debug('importing ' + data.length + ' locations');
      for (let i = 0, len = data.length; i < len; i++) {

        let model = data[i];
        if (model.latitude && model.longitude) {
          let location = new Location({
            type: 'station',
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
  }
};