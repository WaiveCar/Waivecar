'use strict';

let moment    = require('moment');
let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Car       = Bento.model('Car');
let log       = Bento.Log;
let config    = Bento.config.waivecar;

scheduler.process('car-status', function *(job) {
  let cars = yield Car.find();
  for (let i = 0, len = cars.length; i < len; i++) {
    let car = cars[i];

    // ### Unauthorized Entry
    // If car currently has no rider and the doors are unlocked and keys removed we notify admin.

    if (!car.userId && !car.isLocked && !car.isKeySecure) {
      let message = `Unauthorized entry on ${ car.license || car.id } at ${ moment().format('MMMM Do YYYY, h:mm:ss a') } at ${ car.latitude }, ${ car.longitude }`;
      log.info(`Car Status > ${ message }`);
      yield notify.notifyAdmins(message, ['slack', 'sms', 'email']);
    }
  }
});

module.exports = function *() {
  scheduler.add('cars-status', {
    init   : true,
    repeat : true,
    timer  : config.car.status
  });
};
