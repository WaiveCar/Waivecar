let redis = require('../../lib/redis-service');
let notify = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let OrderService = Bento.module('shop/lib/order-service');
let BookingPayment = Bento.model('BookingPayment');
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let User = Bento.model('User');
let moment = require('moment');

scheduler.process('waivework-auto-charge', function*(job) {
  console.log('auto charge job running');
  let today = moment();
  //if ([1, 8, 15, 22].includes(today.date())) {
  // The next line needs to be removed later
  today = today.add(1, 'days');
  console.log('today: ', today);
  let todaysPayments = yield WaiveworkPayment.find({
    where: {
      date: {$lt: today.add(1, 'days').format('YYYY-MM-DD')},
      bookingPaymentId: null,
    },
    include: [
      {
        model: 'Booking',
        as: 'booking',
      },
    ],
  });
  for (let oldPayment of todaysPayments) {
    if (
      redis.shouldProcess('waivework-auto-charge', oldPayment.id, 90 * 1000)
    ) {
      let data = {
        userId: oldPayment.booking.userId,
        amount: oldPayment.amount,
      };
      let user = yield User.findById(oldPayment.booking.userId);
      console.log('user entry', user);
      let shopOrder = (yield OrderService.quickCharge(data)).order;
      let bookingPayment = new BookingPayment({
        bookingId: oldPayment.booking.id,
        orderId: shopOrder.id,
      });
      yield bookingPayment.save();
      console.log('bookingPayment: ', bookingPayment);
      let newPayment = new WaiveworkPayment({
        bookingId: oldPayment.booking.id,
        date: moment().add(7, 'days'),
        bookingPaymentId: null,
        amount: shopOrder.amount,
      });
      yield newPayment.save();
      console.log('new payment: ', newPayment);
      yield oldPayment.update({
        bookingPaymentId: bookingPayment.id,
      });
      yield notify.slack(
        {
          text: ``,
        },
        {channel: '#waivework-charges'},
      );
      console.log('old payment should be updated: ', oldPayment);
    }
  }
  //}
});

module.exports = function*() {
  let testTimer = {value: 2, type: 'minutes'};
  let timer = {value: 24, type: 'hours'};
  scheduler.add('waivework-auto-charge', {
    init: true,
    repeat: true,
    timer: testTimer,
  });
};
