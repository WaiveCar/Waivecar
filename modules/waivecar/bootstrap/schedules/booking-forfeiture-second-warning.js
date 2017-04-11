'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;

scheduler.process('booking-forfeiture-second-warning', function *(job) {
  yield notify.sendTextMessage(job.data.phone, `Hi, it looks like you haven't started your ride yet. Unless you start in about 5 minutes, we'll have to end your booking and make the car available for other users. Please call us if there's difficulty`);
});

module.exports = function *() {
  scheduler('booking-forfeiture-second-warning');
};
