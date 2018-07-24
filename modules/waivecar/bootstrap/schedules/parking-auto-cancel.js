'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');
let ParkingService = require('../../lib/parking-service');
let notify = require('../../lib/notification-service');

scheduler.process('parking-auto-cancel', function*(job) {
  let space = yield ParkingService.cancel(job.data.spaceId);
  console.log('Space After: ', space);
  yield notify.notifyAdmins(
    `:rage: ${job.data.user.firstName} ${
      job.data.user.lastName
    } has reserved parking spot #${space.id}`,
    ['slack'],
    {channel: '#reservations'},
  );
  yield notify.sendTextMessage(job.data.user.id, `Your reservation for space #${space.id} has expired`);
});
