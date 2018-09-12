'use strict';

let queue = Bento.provider('queue');
let scheduler = Bento.provider('queue').scheduler;
let Car = Bento.model('Car');
let notify = require('../../lib/notification-service');

scheduler.process('notify-of-movement', function*(job) {
  let updatedCar = yield Car.findOne({where: {id: job.data.car.id}});
  if (
    job.data.car.latitude !== updatedCar.latitude ||
    job.data.car.longitude !== updatedCar.longitude
  ) {
    yield notify.sendTextMessage(
      job.data._user.id,
      `${updatedCar.license} has now been moved from where you parked it`,
    );
  } else {
    let timerObj = {value: 10, type: 'minutes'};
    queue.scheduler.add('notify-of-movement', {
      uid: `notify-of-movement-${job.data._user.id}`,
      timer: timerObj,
      unique: true,
      data: {
        car: job.data.car,
        _user: job.data._user,
      },
    });
  }
});
