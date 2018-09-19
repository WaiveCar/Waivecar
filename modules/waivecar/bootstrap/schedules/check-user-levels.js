'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let moment = require('moment');
let {exec} = require('child_process');

let execPromise = query => {
  return new Promise((resolve, reject) => {
    exec(query, (error, stdout) => {
      if (error) {
        reject(error);
      }
      resolve(stdout);
    });
  });
};

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
  let stdout = JSON.parse(
    yield execPromise(
      `python3 analysis/carCharge.py ${JSON.stringify(
        mysqlConfig,
      )} ${JSON.stringify(Array.from(usersToProcess))}`,
    ),
  );
  let {newUserRatios, currentThresholds} = stdout;
  for (let userId in newUserRatios) {
    let level;
    switch (true) {
      case newUserRatios[userId] < currentThresholds.normalMinimum:
        level = 'drainer';
        break;
      case newUserRatios[userId] < currentThresholds.chargerMinimum:
        level = 'normal';
        break;
      case newUserRatios[userId] < currentThresholds.superChargerMinimum:
        level = 'charger';
        break;
      default:
        level = 'super-charger';
        break;
    }
    let user = yield User.findById(userId);
    if (!user.level === 'gifted-charger') {
      yield user.update({level});
    }
  }
});

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 15, type: 'seconds'},
  });
};
