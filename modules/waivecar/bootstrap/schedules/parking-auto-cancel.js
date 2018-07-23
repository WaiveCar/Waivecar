'use strict';

let scheduler = Bento.provider('queue').scheduler;
let UserParking = Bento.model('UserParking');

scheduler.process('parking-auto-cancel', function *(job) {
  console.log('job: ', job);
});
