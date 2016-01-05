'use strict';

let Location = Bento.model('Location');
let error    = Bento.Error;
let log      = Bento.Log;
let config   = Bento.config.waivecar;

module.exports = function *() {
  if (!config.mock.homebase) {
    return;
  }

  let count = yield Location.count();
  if (count > 1) {
    return;
  }

  log.debug(`Importing mock homebase`);
  let location = new Location({
    type        : 'homebase',
    name        : `WaiveCar Santa Monica HomeBase`,
    description : `Home to 20 WaiveCars`,
    latitude    : 34.0166784,
    longitude   : -118.4914082,
    address     : '1547 7th Street Santa Monica CA'
  });

  yield location.upsert();
};
