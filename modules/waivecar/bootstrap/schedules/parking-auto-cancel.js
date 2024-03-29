'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');
let ParkingService = require('../../lib/parking-service');
let notify = require('../../lib/notification-service');

scheduler.process('parking-auto-cancel', function*(job) {
  try {
    yield ParkingService.cancel(job.data.spaceId, job.data.reservation.id);
  } catch (error) {
    console.log('error: ', error);
  }
  yield notify.notifyAdmins(
    `:rage: ${job.data.user.firstName} ${
      job.data.user.lastName
    } lost their reservation for WaivePark #${job.data.spaceId}`,
    ['slack'],
    {channel: '#reservations'},
  );
  yield notify.sendTextMessage(
    job.data.user.id,
    `Your reservation for WaivePark #${job.data.spaceId} has expired`,
  );
});
