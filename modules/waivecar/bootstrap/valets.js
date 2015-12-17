'use strict';

let Location = Bento.model('Location');
let error    = Bento.Error;
let log      = Bento.Log;
let config   = Bento.config.waivecar;

module.exports = function *() {
  if (!config.mock.valets) {
    return;
  }

  let count = yield Location.count();
  if (count > 12) {
    return;
  }

  log.debug(`Importing 5 mock valets`);
  for (let i = 1, len = 5; i < len; i++) {
    let location = new Location({
      type        : 'valet',
      name        : `Fred Smith, the ${ i }`,
      description : `Will have a green umbrella and gumboots on.`,
      latitude    : 34.0604643 + (i * .001),
      longitude   : -118.4186743 + (i * .001),
      address     : '1 Mock Street'
    });
    yield location.upsert();
  }
};
