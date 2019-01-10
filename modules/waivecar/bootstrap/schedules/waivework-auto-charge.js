let scheduler = Bento.provider('queue').scheduler;
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let OrderService = Bento.module('shop/lib/order-service');
let BookingPayment = Bento.module('BookingPayment');
let moment = require('moment');

scheduler.process('waivework-auto-charge', function*(job) {
  console.log('auto-charge here');
  let today = moment();
  //if ([1, 8, 15, 22].includes(today.date())) {
  // The next line needs to be removed later
  today = today.add(5, 'days');
  console.log(today);
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
  console.log('todays payments: ', todaysPayments);
  for (let payment of todaysPayments) {
    console.log(payment);
    let data = {
      userId: payment.booking.userId,
      amount: payment.amount,
    };
    let shopOrder = yield OrderService.quickCharge(data)
    console.log('shopOrder: ', shopOrder);
  }
  //}
});

module.exports = function*() {
  scheduler.add('waivework-auto-charge', {
    init: true,
    repeat: true,
    timer: {value: 24, type: 'seconds'},
  });
};
