'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let moment = require('moment');

scheduler.process('check-user-levels', function*(job) {
  console.log('check user levels here');
  let newBookings = yield Booking.find({
    where: {
      createdAt: {
        $gte: moment()
          .subtract(1, 'days')
          .toDate(),
      },
      status: 'completed',
    },
  });
  console.log('new bookings: ', newBookings);
});

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 10, type: 'seconds'},
  });
};
