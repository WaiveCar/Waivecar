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
  let usersToProcess = new Set();
  newBookings.forEach(booking => usersToProcess.add(booking.userId));
  let lastTenBookings = {};
  for (let id of usersToProcess) {
    let temp = yield Booking.find({
      where: {
        userId: id,
        status: 'completed',
      },
      order: [['id', 'DESC']],
      limit: 10,
    });
    lastTenBookings[id] = temp;
  }
  console.log('last 10: ', lastTenBookings);
});

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 10, type: 'seconds'},
  });
};
