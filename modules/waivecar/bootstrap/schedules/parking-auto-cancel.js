'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');

scheduler.process('parking-auto-cancel', function*(job) {
  let space = yield UserParking.findById(job.data.spaceId);
  yield space.update({
    reserved: false,
    reservedById: null,
    reservedAt: null
  });
  console.log('updated: ', space);
});
