'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');
let ParkingService = require('../../lib/parking-service');
let notify = require('../../lib/notification-service');

scheduler.process('parking-auto-cancel', function*(job) {
  yield ParkingService.cancel(job.data.spaceId, job.data.user.id, job.data.reservation.id);
  yield notify.notifyAdmins(
    `:rage: ${job.data.user.firstName} ${
      job.data.user.lastName
    } has reserved parking spot #${job.data.spaceId}`,
    ['slack'],
    {channel: '#reservations'},
  );
  yield notify.sendTextMessage(job.data.user.id, `Your reservation for space #${job.data.spaceId} has expired`);
});
