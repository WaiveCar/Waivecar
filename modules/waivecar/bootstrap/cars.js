'use strict';

let _     = require('lodash');
let log   = Reach.Log;
let query = Reach.service('mysql/query');
let Car   = Reach.model('Car');

module.exports = function *() {
  let count = yield query.count('cars');
  if (count > 100) {
    return;
  }

  log.debug('importing 190 mock cars');
  for (let i = 0, len = 190; i < len; i++) {
    let car = new Car({
      id           : 'MOCK' + i,
      make         : 'Chevrolet',
      model        : 'Spark EV',
      year         : '2015',
      manufacturer : 'General Motors'
    });

    yield car.upsert();
  }
};