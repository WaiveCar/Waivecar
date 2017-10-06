'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;

scheduler.process('booking-forfeiture-first-warning', function *(job) {
  yield notify.sendTextMessage(job.data.userId, `Hi, we notice you haven't started the car. Feel free to call us if you are having troubles.`);
  yield notify.sendPushNotification(job.data.userId, `Hi, we notice you haven't started the car. Feel free to call us if you are having troubles.`);
});

module.exports = function *() {
  scheduler('booking-forfeiture-first-warning');
};
