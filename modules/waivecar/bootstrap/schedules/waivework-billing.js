let redis = require('../../lib/redis-service');
let sequelize = require('sequelize');
let notify = require('../../lib/notification-service');
let Slack = Bento.provider('slack');
let slack = new Slack('notifications');
let scheduler = Bento.provider('queue').scheduler;
let Email = Bento.provider('email');
let Booking = Bento.model('Booking');
let User = Bento.model('User');
let OrderService = Bento.module('shop/lib/order-service');
let BookingPayment = Bento.model('BookingPayment');
let WaiveworkPayment = Bento.model('WaiveworkPayment');
let CarHistory = Bento.model('CarHistory');
let config = Bento.config;
let moment = require('moment');
let log = Bento.Log;
let uuid = require('uuid');

scheduler.process('waivework-billing', function*(job) {
  // The first section of this process checks all of the current waivework bookings to make
  // sure the cars are being driven 100 miles a day. If they are not, a notification is sent to slack
  let currentWaiveworkBookings = (yield Booking.find({
    where: {
      status: 'started',
    },
  })).filter(each => each.isFlagged('Waivework'));
  let dailyMilesPayload = [
    ':scream_cat: *The following users are not driving 100 miles per day:*\n',
  ];
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
        dailyMilesPayload.push(
          `${user.link()}'s average mileage is ${Math.floor(
            averagePerDay,
          )} per day.`,
        );
      }
    }
  }
  if (dailyMilesPayload.length > 1) {
    yield notify.slack(
      {text: dailyMilesPayload.join('\n')},
      {channel: '#waivework-charges'},
    );
  }

  let today = moment();
  let currentDay = today.date();

  // The unpaid WaiveworkPayments that are created on the previous billing date
  // are the ones that are queried for (where the bookingPaymentId is null). Automatic billing
  // works by making the charge that was scheduled on the previous billing date and
  // then schdeduling a new (unpaid) WaiveworkPayment for the next billing date.
  // This is a payment reminder to be sent out the
  let lastReminder = moment().daysInMonth() - 1;
  // If the current day is two days before the current payment date, a reminder will need to be sent out
  if ([6, 13, 20, lastReminder].includes(currentDay)) {
    let todaysPayments = yield WaiveworkPayment.find({
      where: {
        date: {
          $gt: moment(today).format('YYYY-MM-DD'),
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
    for (let upcomingPayment of todaysPayments) {
      if (
        yield redis.shouldProcess(
          'waivework-auto-charge',
          upcomingPayment.id,
          90 * 1000,
        )
      ) {
        let user = yield User.findById(upcomingPayment.booking.userId);
        let email = new Email(),
          emailOpts = {};
        try {
          yield notify.sendTextMessage(
            user,
            `Just a reminder! Your credit card will be charged $${(
              upcomingPayment.amount / 100
            ).toFixed(
              2,
            )} automatically for the next week of your WaiveWork booking.`,
          );
          emailOpts = {
            to: user.email,
            from: config.email.sender,
            subject: 'Your Upcoming WaiveWork Payment',
            template: 'waivework-payment-reminder',
            context: {
              name: `${user.firstName} ${user.lastName}`,
              amount: (upcomingPayment.amount / 100).toFixed(2),
            },
          };
          yield email.send(emailOpts);
        } catch (e) {
          log.warn('error sending email', e);
        }
      }
    }
  }
  let chargesPayload = [
    ':watch: *The following users are to be charged automatically this week:* \n',
  ];
  let failedChargePayload = [
    ":male_vampire: *The following users's weekly automatic charges have failed:* \n",
  ];
  let firstChargePayload = [
    ':one: *The following users are making their first full payment this week. Please manually review them before chargng:* \n',
  ];
  let toImmobilize = [];
  // Users will only be billed on the 1st, 8th 15th and 22nd of each month.
  currentDay = 22;
  if ([1, 8, 15, 22].includes(currentDay)) {
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
        yield redis.shouldProcess(
          'waivework-auto-charge',
          oldPayment.id,
          90 * 1000,
        )
      ) {
        let endText;
        let data = {
          userId: oldPayment.booking.userId,
          amount: oldPayment.amount,
          source: 'Waivework auto charge',
          description:
            'Weekly charge for waivework - automatically on schduled day',
        };
        // The line below should be removed later once we are done watching to see if the payment process
        // works reliably. Currently, the user will just be charged $0. The charge entry created by this charge
        // is necessary for the scheduling of the new charge. It can be toggled in and out for turning on/off charging users
        ///////
        //data.amount = 0;
        //////

        data.waivework = true;
        let user = yield User.findById(oldPayment.booking.userId);
        let isFirstPayment =
          (yield WaiveworkPayment.find({
            where: {
              bookingId: oldPayment.bookingId,
            },
          })).length === 1;
        if (isFirstPayment) {
          firstChargePayload.push(
            `${user.link()}'s charge of $${(oldPayment.amount / 100).toFixed(
              2,
            )}.`,
          );
          // A dummy shopOrder must be made for inital payments so that the next payments may be made
          data.amount = 0;
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
        } else {
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
            endText = `Your weekly payment for WaiveWork of ${(
              oldPayment.amount / 100
            ).toFixed(2)} was successful!`;
          } catch (e) {
            failedChargePayload.push(
              `${user.link()} had a failed charge of $${(
                oldPayment.amount / 100
              ).toFixed(2)}. ${e.message}`,
            );
            yield oldPayment.update({
              bookingPaymentId: e.shopOrder.id,
            });
            endText = `Your weekly payment for WaiveWork of ${(
              oldPayment.amount / 100
            ).toFixed(
              2,
            )} has failed. Please contact us about paying it. If it is not paid in a timely manner, your car may be immobilized.`;
            toImmobilize.push(oldPayment);
          }
        }
        let dates = [8, 15, 22, 1, 8];
        let nextDay = dates[dates.indexOf(currentDay) + 1];
        let toAddMonth = currentDay === 22;
        let nextDate = moment()
          .month(toAddMonth ? moment().month() + 1 : moment().month())
          .date(nextDay);
        let newPayment = new WaiveworkPayment({
          bookingId: oldPayment.booking.id,
          date: nextDate,
          bookingPaymentId: null,
          amount: oldPayment.amount,
        });
        yield newPayment.save();
        if (!isFirstPayment) {
          chargesPayload.push(
            `${user.link()} charged $${(oldPayment.amount / 100).toFixed(
              2,
            )} automatically.`,
          );
          let email = new Email(),
            emailOpts = {};
          if (data.amount > 0) {
            try {
              yield notify.sendTextMessage(user, endText);
              emailOpts = {
                to: user.email,
                from: config.email.sender,
                subject: 'Your WaiveWork Payment',
                template: 'waivework-general',
                context: {
                  name: `${user.firstName} ${user.lastName}`,
                  text: endText,
                },
              };
              yield email.send(emailOpts);
            } catch (e) {
              log.warn('error sending email', e);
            }
          }
        }
      }
    }
    try {
      // Make sure to change the timer back from seconds to hours
      scheduler.add('waivework-immobilize', {
        // A uid based on something needs to be added here because the code will run on both servers
        uid: `waivework-immobilize-${uuid.v4()}`,
        timer: {value: 24, type: 'seconds'},
        data: {
          toImmobilize,
        },
      });
    } catch (e) {
      log.warn('error starting immobilizer timer: ', e);
    }
    if (chargesPayload.length > 1) {
      yield notify.slack(
        {text: chargesPayload.join('\n')},
        {channel: '#waivework-charges'},
      );
    }
    if (failedChargePayload.length > 1) {
      yield notify.slack(
        {text: failedChargePayload.join('\n')},
        {channel: '#waivework-charges'},
      );
    }
    if (firstChargePayload.length > 1) {
      yield notify.slack(
        {text: firstChargePayload.join('\n')},
        {channel: '#waivework-charges'},
      );
    }
  }
});

module.exports = function*() {
  // Change this timer back to hours!!!
  let timer = {value: 24, type: 'seconds'};
  scheduler.add('waivework-billing', {
    init: true,
    repeat: true,
    timer,
  });
};
