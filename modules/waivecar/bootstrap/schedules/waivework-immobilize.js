let scheduler = Bento.provider('queue').scheduler;
let carService = require('../../lib/car-service');
let notify = require('../../lib/notification-service');
let ShopOrder = Bento.model('Shop/Order');
let moment = require('moment');
let log = Bento.Log;

scheduler.process('waivework-immobilize', function*(job) {
  for (let oldPayment of job.data.toImmobilize) {
    let recentOrder = yield ShopOrder.findOne({
      where: {
        userId: oldPayment.booking.userId,
        amount: oldPayment.amount,
        createdAt: {
          $gte: moment()
            .subtract(24, 'hours')
            .format('YYYY-MM-DD'),
        },
        status: 'paid',
      },
    });
    if (!recentOrder) {
      try {
        yield carService.lockImmobilizer(oldPayment.booking.carId, null, true);
      } catch (e) {
        log.warn('error immobilizing: ', e);
      }
      try {
        yield notify.sendTextMessage(
          {id: oldPayment.booking.userId},
          'It has been 24 hours since your payment for WaiveWork failed. Your car has been immobilized until you have successfully paid. Please contact us to resolve the issue.',
        );
      } catch (e) {
        log.warn('error sending text: ', e);
      }
    }
  }
});

module.exports = function*() {
  scheduler('booking-auto-cancel');
};
