'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let relay     = Bento.Relay;

scheduler.process('booking-free-timer', function *(job) {
  // ...
});

module.exports = function *() {
  scheduler('booking-free-timer');
};
