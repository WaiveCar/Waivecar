'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;

scheduler.process('booking-free-timer', function *(job) {
  /*
  yield notify.sendTextMessage(job.data.phone, `Hey! Just a heads up, you have 30 more free minutes in your WaiveCar reservation. After that, we charge $5.99 per hour. As a reminder, please return your WaiveCar to our return zone, and try to leave it at a charger. You can find both in our app. Thanks!`)
  */
});

module.exports = function *() {
  scheduler('booking-free-timer');
};
