let redis = require('../../lib/redis-service');
let notify = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Email = Bento.provider('email');
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let OrderService = Bento.module('shop/lib/order-service');
let BookingPayment = Bento.model('BookingPayment');
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let CarHistory = Bento.model('CarHistory');
let moment = require('moment');

scheduler.process('waivework-billing', function*(job) {
  // The first section of this process checks all of the current waivework bookings to make
  // sure the cars are being driven 100 miles a day. If they are not, a notification is sent to slack
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
      // Because the mileage is stored once per day, the average mileage per day may be found by
      // dividing the miles since the beginning of the booking by the number of days in the car history
      let averagePerDay =
        (Number(history[history.length - 1].data) - Number(history[0].data)) /
        history.length *
        0.621371;
      if (
        averagePerDay < 100 &&
        (yield redis.shouldProcess(
          'waivework-mileage-check',
          booking.carId,
          90 * 1000,
        ))
      ) {
        let user = yield User.findById(booking.userId);
        yield notify.slack(
          {
            text: `:scream_cat: Uh Oh! ${user.link()} is not driving 100 miles per day. Their current average mileage is ${Math.floor(
              averagePerDay,
            )} per day.`,
          },
          {channel: '#waivework-charges'},
        );
      }
    }
  }

  let today = moment();

  // The unpaid WaiveworkPayments that are created on the previous billing date
  // are the ones that are queried for (where the bookingPaymentId is null). Automatic billing
  // works by making the charge that was scheduled on the previous billing date and
  // then schdeduling a new (unpaid) WaiveworkPayment for the next billing date.
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

  // This is a payment reminder to be sent out the
  let lastReminder = moment().daysInMonth() - 1;
  // If the current day is two days before the current payment date, a reminder will need to be sent out
  if ([6, 13, 20, lastReminder].includes(today.date())) {
    for (let oldPayment of todaysPayments) {
      if (
        yield redis.shouldProcess(
          'waivework-auto-charge',
          oldPayment.id,
          90 * 1000,
        )
      ) {
        let user = yield User.findById(oldPayment.booking.userId);
        let email = new Email(),
          emailOpts = {};
        try {
          yield notify.sendTextMessage(
            user,
            `Something, something dark side... something, something complete`,
          );
          emailOpts = {
            to: user.email,
            from: config.email.sender,
            subject: 'Your Upcoming WaiveWork Payment',
            template: 'waivework-payment-reminder',
            context: {
              name: `${user.firstName} ${user.lastName}`,
              amount: (oldPayment.amount / 100).toFixed(2),
            },
          };
        } catch (e) {
          console.log('error sending email', e);
        }
      }
    }
  }

  // Users will only be billed on the 1st, 8th 15th and 22nd of each month.
  if ([1, 8, 15, 22].includes(today.date())) {
    for (let oldPayment of todaysPayments) {
      if (
        yield redis.shouldProcess(
          'waivework-auto-charge',
          oldPayment.id,
          90 * 1000,
        )
      ) {
        let data = {
          userId: oldPayment.booking.userId,
          amount: oldPayment.amount,
          source: 'Waivework auto charge',
          description: 'Weekly charge for waivework',
        };
        // The line below should be removed later once we are done watching to see if the payment process
        // works reliably. Currently, the user will just be charged $0. The charge entry created by this charge
        // is necessary for the scheduling of the new charge.
        data.amount = 0;
        data.waivework = true;
        let user = yield User.findById(oldPayment.booking.userId);
        try {
          let shopOrder = (yield OrderService.quickCharge(data, null, {
            nocredit: true,
          })).order;

          let bookingPayment = new BookingPayment({
            bookingId: oldPayment.booking.id,
            orderId: shopOrder.id,
          });
          yield bookingPayment.save();
          yield oldPayment.update({
            bookingPaymentId: bookingPayment.id,
          });
        } catch (e) {
          yield notify.slack(
            {
              text: `:male_vampire: ${user.link()} had a failed charge of $${(
                oldPayment.amount / 100
              ).toFixed(2)} for their Waivework Rental. ${e.message}`,
            },
            {channel: '#waivework-charges'},
          );
          yield oldPayment.update({
            bookingPaymentId: e.shopOrder.id,
          });
        }

        let newPayment = new WaiveworkPayment({
          bookingId: oldPayment.booking.id,
          date: moment().add(7, 'days'),
          bookingPaymentId: null,
          amount: oldPayment.amount,
        });
        yield newPayment.save();
        // For now, this Slack notification should indicate to Frank when to charge the users manually during
        // the testing period for this process
        yield notify.slack(
          {
            text: `:watch: ${user.link()} to be charged $${(
              oldPayment.amount / 100
            ).toFixed(2)} today for their Waivework Rental`,
          },
          {channel: '#waivework-charges'},
        );
      }
    }
  }
});

module.exports = function*() {
  let timer = {value: 24, type: 'hours'};
  scheduler.add('waivework-billing', {
    init: true,
    repeat: true,
    timer,
  });
};
