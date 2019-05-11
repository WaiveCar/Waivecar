let scheduler = Bento.provider('queue').scheduler;
let carService = require('../../lib/car-service');
let ShopOrder = Bento.model('Shop/Order');
let moment = require('moment');

scheduler.process('waivework-immobilize', function*(job) {
  for (let oldPayment of job.data.toImmobilize) {
    let recentOrders = yield ShopOrder.find({
      where: {
        userId: oldPayment.booking.userId,
        amount: oldPayment.amount,
        createdAt: {$gte: moment().subtract(24, 'hours').format('YYYY-MM-DD')},
      },
    });
    console.log('recentOrders', recentOrders);
  }
  /*
  try {
    yield carService.lockImmobilizer(job.booking.carId, null, true);
  } catch (e) {
    log.warn('error: ', e);
  }
  */
});

module.exports = function*() {
  scheduler('booking-auto-cancel');
};
