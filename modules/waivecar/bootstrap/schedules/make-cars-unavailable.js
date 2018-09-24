'use strict';

let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let moment = require('moment');


scheduler.process('make-cars-unavailable', function*(job) {
  console.log('cars to be made unavailable');
});

module.exports = function *() {
  let secondsUntilTime = moment().diff(moment().hour(1).minute(0).second(0), 'seconds');
  console.log('seconds until: ', secondsUntilTime);
  let timerObj = {value: secondsUntilTime, type: 'seconds'};
  scheduler.add('make-cars-unavailable', {
    init   : true,
    repeat : false,
    timer  : timerObj,
  });
};
