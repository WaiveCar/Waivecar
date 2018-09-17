'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let moment = require('moment');
let {exec} = require('child_process');

scheduler.process('check-user-levels', function*(job) {
  console.log('check user levels here');
  let newBookings = yield Booking.find({
    where: {
      createdAt: {
        $gte: moment()
          .subtract(4, 'days')
          .toDate(),
      },
      status: 'completed',
    },
  });
  let usersToProcess = new Set();
  newBookings.forEach(booking => usersToProcess.add(booking.userId));

  console.log('list of users to check: ', usersToProcess);

  let recentBookings = {};
  for (let id of usersToProcess) {
    recentBookings[id] = yield Booking.find({
      where: {
        userId: id,
        status: 'completed',
      },
      order: [['id', 'DESC']],
      limit: 20,
      include: [
        {
          model: 'BookingDetails',
          as: 'details',
        },
      ],
    });
  }
  yield calculateLevel();
  exec('python3 analysis/carCharge.py', (err, stdout, stderr) => {
    if (err) {
      console.log(`error: ${err}`);
    }
    if (stderr) {
      console.log(`stderr:  ${stderr}`);
    }
    console.log(`stdout: ${stdout}`);
  });
  /*
  for (let user in recentBookings) {
    recentBookings[user].forEach(booking => console.log(booking.details));
  }
  */
});

let calculateLevel = function*(bookings) {
  console.log('calculate level with this fucntion');
};

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 10, type: 'seconds'},
  });
};
