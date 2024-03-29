'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let moment = require('moment');
let {exec} = require('child_process');
let fs = require('fs');

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

let appendFilePromise = (path, text) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, text, error => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
};

scheduler.process('check-user-levels', function*(job) {
  // This finds new bookings so that a list of users that need to be updated can be found
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

  // This is for passing the necessary mysql config information to the script that calculates user ratios
  let mysqlConfig = JSON.stringify({
    database: Bento.config.sequelize.database,
    username: Bento.config.sequelize.username,
    password: Bento.config.sequelize.password,
  });

  yield appendFilePromise(
    '/var/log/outgoing/user-levels.txt',
    `\n${new Date(Date.now()).toDateString()}:\nUser Level Updates:\n`,
  );

  let scriptOutput = JSON.parse(
    yield execPromise(
      `python3 analysis/carCharge.py ${JSON.stringify(
        mysqlConfig,
      )} ${JSON.stringify(Array.from(usersToProcess))}`,
    ),
  );

  let {newUserRatios, currentThresholds} = scriptOutput;
  // The new level is found for all the users that need updating and they are updated below
  for (let userId in newUserRatios) {
    let level;
    switch (true) {
      case newUserRatios[userId] > currentThresholds.normalMaximum:
        level = 'drainer';
        break;
      case newUserRatios[userId] > currentThresholds.chargerMaximum:
        level = 'normal';
        break;
      case newUserRatios[userId] > currentThresholds.superChargerMaximum:
        level = 'charger';
        break;
      default:
        level = 'super-charger';
        break;
    }
    let user = yield User.findById(userId);
    if (user.level !== 'gifted-charger') {
      yield user.update({level});
      yield appendFilePromise(
        '/var/log/outgoing/user-levels.txt',
        `User ${user.id}: ${user.firstName} ${user.lastName} ${level}\n`,
      );
    }
  }
  let sitTimesOutput = JSON.parse(
    yield execPromise(
      `python3 analysis/sitTimes.py ${JSON.stringify(
        mysqlConfig,
      )} ${JSON.stringify(
        moment
          .utc()
          .subtract(3, 'months')
          .format('YYYY-MM-DD'),
      )}`,
    ),
  );
  yield appendFilePromise(
    '/var/log/outgoing/user-levels.txt',
    '\nsitTime Outlier Ratios: \n\n',
  );
  for (let id in sitTimesOutput) {
    let user = yield User.findById(id);
    let currentSitTimeRatio = sitTimesOutput[id].ratio;
    yield user.update({
      sitTimeOutliers: currentSitTimeRatio,
    });
    yield appendFilePromise(
      '/var/log/outgoing/user-levels.txt',
      `User ${user.id}: ${user.firstName} ${
        user.lastName
      } ${currentSitTimeRatio}\n`,
    );
  }
});

module.exports = function*() {
  scheduler.add('check-user-levels', {
    init: true,
    repeat: true,
    timer: {value: 24, type: 'hours'},
  });
};
