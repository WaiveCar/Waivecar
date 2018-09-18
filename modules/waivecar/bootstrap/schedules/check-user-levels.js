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

  /* This is likely not needed
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
  */
  let config = JSON.stringify({
    database: Bento.config.sequelize.database,
    username: Bento.config.sequelize.username,
    password: Bento.config.sequelize.password,
  });
  exec(
    `python3 analysis/carCharge.py ${JSON.stringify(config)} ${JSON.stringify(
      Array.from(usersToProcess),
    )}`,
    (err, stdout) => {
      if (err) {
        console.log(`error: ${err}`);
      }
      //let data = JSON.parse(stdout.replace(/'/g, `"`));
      //console.log(data.normalMinimum);
      console.log(stdout);
    },
  );
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
