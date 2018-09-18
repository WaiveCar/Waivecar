'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let moment = require('moment');
let {exec} = require('child_process');

let execPromise = (query) => {
  return new Promise((resolve, reject) => {
    exec(query, (error, stdout) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
}
  /*
let calculateRatio = function*(booking) {
  let vehicleMultiplier =
};*/

scheduler.process('check-user-levels', function*(job) {
  let newBookings = yield Booking.find({
    where: {
      createdAt: {
        $gte: moment()
          .subtract(5, 'days')
          .toDate(),
      },
      status: 'completed',
    },
  });

  let usersToProcess = new Set();
  newBookings.forEach(booking => usersToProcess.add(booking.userId));

  let mysqlConfig = JSON.stringify({
    database: Bento.config.sequelize.database,
    username: Bento.config.sequelize.username,
    password: Bento.config.sequelize.password,
  });
  try {
    let thresholds = yield execPromise(
      `python3 analysis/carCharge.py ${JSON.stringify(mysqlConfig)} ${JSON.stringify(Array.from(usersToProcess))}`
    );
    console.log(thresholds);
  } catch(err) {
    console.log('error: ', err);
  }
  /*
  thresholds = JSON.parse(thresholds.replace(/'/g, `"`));

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
        {
          model: 'Car',
          as: 'car',
        }
      ],
    });
  }

  for (let user in recentBookings) {
    for (let booking of recentBookings[user]) {
      yield calculateRatio(booking);
    }
  }
  */
});

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 30, type: 'seconds'},
  });
};
