'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;

scheduler.process('booking-free-timer-expired', function *(job) {
  yield notify.sendTextMessage(job.data.phone, `Hey there! Your free 2 hour WaiveCar rental has expired. Additional hours are billed at $5.99 per hour until you end your rental in the WaiveCar app.`);
});

module.exports = function *() {
  scheduler('booking-free-timer-expired');
};
