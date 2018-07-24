'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');
let relay = Bento.Relay;
let notify = require('../../lib/notification-service');

scheduler.process('parking-auto-cancel', function*(job) {
  let space = yield UserParking.findById(job.data.spaceId);
  let currentUserId = space.reservedById;
  yield space.update({
    reserved: false,
    reservedById: null,
    reservedAt: null,
  });
  relay.user(currentUserId, 'userParking', {
    type: 'update',
    data: space.toJSON(),
  });
  relay.admin('userParking', {
    type: 'update',
    data: space.toJSON(),
  });
  yield notify.notifyAdmins(
    `:rage: ${job.data.user.firstName} ${
      job.data.user.lastName
    } has reserved parking spot #${space.id}`,
    ['slack'],
    {channel: '#reservations'},
  );
  yield notify.sendTextMessage(job.data.user.id, `Your reservation for space #${space.id} has expired`);
});
