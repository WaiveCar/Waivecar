'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');
let relay = Bento.Relay;

scheduler.process('parking-auto-cancel', function*(job) {
  let space = yield UserParking.findById(job.data.spaceId);
  let currentUserId = space.reservedById;
  yield space.update({
    reserved: false,
    reservedById: null,
    reservedAt: null,
  });
  console.log('updated: ', space);
  relay.user(currentUserId, 'userParking', {
    type: 'update',
    data: space.toJSON(),
  });
  relay.admin('userParking', {
    type: 'update',
    data: space.toJSON(),
  });
    console.log('events emitted');
});
