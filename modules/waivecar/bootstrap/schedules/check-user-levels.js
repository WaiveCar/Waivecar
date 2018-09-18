'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let moment = require('moment');
let {exec} = require('child_process');

function execPromise(query) {
  return new Promise((resolve, reject) => {
    exec(query, (error, stdout) => {
      if (error) {
        throw error;
      }
      resolve(stdout);
    });
  });
}

scheduler.process('check-user-levels', function*(job) {
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

  let config = JSON.stringify({
    database: Bento.config.sequelize.database,
    username: Bento.config.sequelize.username,
    password: Bento.config.sequelize.password,
  });
  let thresholds = yield execPromise(
    `python3 analysis/carCharge.py ${JSON.stringify(config)}`,
  );
  thresholds = JSON.parse(thresholds.replace(/'/g, `"`));
  console.log(thresholds);
  /*
  exec(
    `python3 analysis/carCharge.py ${JSON.stringify(config)}`,
    (err, stdout) => {
      if (err) {
        console.log(`error: ${err}`);
      }
      let thresholds = JSON.parse(stdout.replace(/'/g, `"`));
    },
  );
  */
});

let calculateRatio = function*(booking) {
  console.log('calculate level with this fucntion');
  console.log('booking: ', booking);
};

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 10, type: 'seconds'},
  });
};
