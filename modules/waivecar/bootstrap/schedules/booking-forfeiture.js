'use strict';

let notify    = require('../../lib/notification-service');
let bookingService   = require('../../lib/booking-service');
let UserLog   = require('../../../log/lib/log-service');
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let UserService   = require('../../lib/user-service.js');
let scheduler = Bento.provider('queue').scheduler;
let moment    = require('moment');

scheduler.process('booking-forfeiture', function *(job) {
  let booking = yield Booking.findById(job.data.bookingId);
  let user = yield UserService.get(job.data.userId);
  let car = yield Car.findById(booking.carId);

  // see https://github.com/WaiveCar/Waivecar/issues/816
  // Make sure server received updates from cars during the forfeit window
  let timeSinceCarUpdated = moment().diff(car.updatedAt, 'minutes');

  if (timeSinceCarUpdated > 15) {
    let adminMessage = `${ car.license } NOT forfeited due to API errors.`;
    yield notify.notifyAdmins(adminMessage, [ 'slack' ], { channel : '#rental-alerts' });
    return true;
  }

  yield bookingService.end(job.data.bookingId, user, {force: true});
  yield booking.flag('forfeit');
  yield UserLog.addUserEvent(user, 'FORFEIT', booking.id);

  yield notify.sendTextMessage(job.data.userId, `Hi, unfortunately we've had to make the car available for other users. We're sorry if there was difficulty starting the vehicle. Please call us if there's any questions or concerns.`);

  let adminMessage = `:shoe: ${ user.name() } forfeited ${ car.license }`;
  yield notify.notifyAdmins(adminMessage, [ 'slack' ], { channel : '#rental-alerts' });
});

module.exports = function *() {
  scheduler('booking-forfeiture');
};
