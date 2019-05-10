let scheduler = Bento.provider('queue').scheduler;
let carService = require('../../lib/car-service');

scheduler.process('waivework-immobilize', function*(job) {
  console.log('job.data', job.data);
  /*
  try {
    yield carService.lockImmobilizer(job.booking.carId, null, true);
  } catch (e) {
    log.warn('error: ', e);
  }
  */
});

module.exports = function *() {
  scheduler('booking-auto-cancel');
}
