let scheduler = Bento.provider('queue').scheduler;
let carService = require('../../lib/car-service');
let notify = require('../../lib/notification-service');
let ShopOrder = Bento.model('Shop/Order');
let User = Bento.model('User');
let Car = Bento.model('Car');
let moment = require('moment');
let log = Bento.Log;

scheduler.process('waivework-immobilize', function*(job) {
  let slackPayload = [
    ':violin: *The following users have had their cars immobilized due to their faillure pay in the 24 hours following their failed automatic payment*\n',
  ];
  for (let oldPayment of job.data.toImmobilize) {
    // This looks to see if they have successfully paid the weekly charge in the preceeding 24 hours by
    // finding any successful charges for the amount of the payment.
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
      let user = yield User.findById(oldPayment.booking.userId);
      let car = yield Car.findById(oldPayment.booking.carId);
      slackPayload.push(`${user.link()} in ${car.link()}\n`);
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
  if (slackPayload.length > 1) {
    yield notify.slack(
      {text: slackPayload.join('\n')},
      {channel: '#waivework-charges'},
    );
  }
});

module.exports = function*() {
  scheduler('waivework-immobilize');
};
