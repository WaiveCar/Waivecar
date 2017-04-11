'use strict';

let notify    = require('../../lib/notification-service');
let bookingService   = require('../../lib/booking-service');
let Booking   = Bento.model('Booking');
let scheduler = Bento.provider('queue').scheduler;

scheduler.process('booking-forfeiture', function *(job) {
  console.log("booking-forfeiture execution started");

  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
  yield bookingService.forfeitureBooking(booking);

  yield notify.sendTextMessage(job.data.phone, `Hi, unfortunately we've had to make the care available for other users. We're sorry if there was difficulty starting the vehicle. Please call us if there's any questions or concerns`);

  let adminMessage = `Forfeiture of car ${ booking.carId }`;
  yield notify.notifyAdmins(adminMessage, [ 'slack', 'sms', 'email' ], { channel : '#rental-alerts' });

});

module.exports = function *() {
  scheduler('booking-forfeiture');
};
