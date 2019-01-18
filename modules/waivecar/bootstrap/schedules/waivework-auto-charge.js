let redis = require('../../lib/redis-service');
let notify = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let OrderService = Bento.module('shop/lib/order-service');
let BookingPayment = Bento.model('BookingPayment');
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let CarHistory = Bento.model('CarHistory');
let moment = require('moment');

scheduler.process('waivework-auto-charge', function*(job) {
  let currentWaiveworkBookings = (yield Booking.find({
    where: {
      status: 'started',
    },
  })).filter(each => each.isFlagged('Waivework'));
  for (let booking of currentWaiveworkBookings) {
    let history = yield CarHistory.find({
      where: {
        carId: booking.carId,
        createdAt: {$gt: booking.createdAt},
      },
    });
    if (history.length) {
      let averagePerDay =
        (Number(history[history.length - 1].data) - Number(history[0].data)) /
        history.length *
        0.621371;
      if (averagePerDay < 100) {
        let user = yield User.findById(booking.userId);
        yield notify.slack(
          {
            text: `Uh Oh! ${user.link()} is not driving 100 miles per day. Their current average mileage is ${Math.floor(
              averagePerDay,
            )} per day.`,
          },
          {channel: '#waivework-charges'},
        );
      }
    }
  }

  let today = moment();
  if ([1, 8, 15, 22].includes(today.date())) {
    let todaysPayments = yield WaiveworkPayment.find({
      where: {
        date: {
          $lt: moment(today)
            .add(1, 'days')
            .format('YYYY-MM-DD'),
        },
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
          source: 'Waivework auto charge',
          description: 'Weekly charge for waivework',
        };
        let user = yield User.findById(oldPayment.booking.userId);
        let shopOrder = (yield OrderService.quickCharge(data)).order;
        // The line below should be removed later once we are done watching to see if the payment process works reliably
        // Currently, the user will just be charged $0.
        data.amount = 0;
        data.waivework = true;
        let bookingPayment = new BookingPayment({
          bookingId: oldPayment.booking.id,
          orderId: shopOrder.id,
        });
        yield bookingPayment.save();
        let newPayment = new WaiveworkPayment({
          bookingId: oldPayment.booking.id,
          date: moment().add(7, 'days'),
          bookingPaymentId: null,
          amount: shopOrder.amount,
        });
        yield newPayment.save();
        yield oldPayment.update({
          bookingPaymentId: bookingPayment.id,
        });
        yield notify.slack(
          {
            text: `${user.link()} to be charged $${(
              oldPayment.amount / 100
            ).toFixed(2)} for their Waivework Rental`,
          },
          {channel: '#waivework-charges'},
        );
      }
    }
  }
});

module.exports = function*() {
  let timer = {value: 24, type: 'hours'};
  scheduler.add('waivework-auto-charge', {
    init: true,
    repeat: true,
    timer,
  });
};
