'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let User      = Bento.model('User');
let log       = Bento.Log;
let relay     = Bento.Relay;
let error     = Bento.Error;
let config    = Bento.config.waivecar;
let RedisService   = require('../../lib/redis-service');
let BookingService = require('../../lib/booking-service');


// See #550 - Allow user to extend Reservation period for $1.
// This dictates a few things.  First we have a timeout-delta
// timer that advertises to the user of this feature.
//
// If they buy in then we don't cancel any timer. Instead we 
// (1) set a flag on the booking id in the db
//
// As we go through our normal timeout sequence we (2) look for 
// the flag. If we find it then we (3) clear the flag, (4) set a NEW 
// timer (as of this writing for 10 minutes - subject to change like all
// numerical constants in comments) and exit.
//
// When the code revisits the auto-cancel it will be a proper extra 10 minutes
// as counted from the end of the initial 15. It will fail to find the 
// flag and then continue.
//
// This method allows us to not put a bunch of added logic into things.
//
// > I guess if this changes in the future one could modify the redis keys to
// > hold a meaningful value other than simply existing.  So this appears to
// > also be magically future proof for an unanticipatedly more complex world
// > without having to fold the existing scheduler logic into booking records.
// >
// > The only downside to this is that we will have a normalized way to find
// > who opted in, which is fine for report generations.
//
// This is slightly incorrect as eventually I decided to just make it
// a booking flag ... it's likely easier
//
scheduler.process('booking-extension-offer', function *(job) {
  try {
    let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
    let car = yield Car.findById(booking.carId);
    let driver = yield User.findById(booking.userId);

    if(booking && booking.status === 'reserved' && !booking.isFlagged('extended')) {
      // if the driver has a good amount of credit we try to encourage them to use it here.
      let goad = '';
      if(driver.credit > 600) {
        goad = `(You've got $${(driver.credit / 100).toFixed(2)} in credit!) `;
      }

      yield notify.sendTextMessage(booking.userId, `${car.info()} reservation time is almost up! Need longer? Respond "SAVE" to get 10 more minutes for just a dollar ${goad}and $0.30/min thereafter until you start your ride.`);
    }
  } catch(ex) {
    console.log(ex);
  }
});

scheduler.process('booking-extension-reminder', function *(job) {
  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
  if(booking && booking.status === 'reserved') {
    let car = yield Car.findById(booking.carId);
    let minutesOver = Math.ceil( Math.max(0, (new Date() - booking.reservationEnd) / (1000 * 60) ));
    yield notify.sendTextMessage(booking.userId, `You're ${minutesOver}min into your ${ car.license } extension. Reply with "abort" to end the reservation and cancel the ride.`);

    if(minutesOver > 21) {
      let driver = yield User.findById(booking.userId);
      yield notify.notifyAdmins(`:turtle:The lollygagger ${ driver.link() } is ${ minutesOver }min into their extension with ${ car.info() }`, [ 'slack' ], { channel : '#reservations' });
    }

    console.log("Booking-before...");
    scheduler.add('booking-extension-reminder', {
      uid   : `booking-${ booking.id }-${ minutesOver }`,
      timer : { value : 6, type  : 'minutes' },
      data  : {
        bookingId : booking.id
      }
    });
    console.log("Booking-after...");
  }
});


scheduler.process('booking-auto-cancel', function *(job) {
  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });

  if (!booking) {
    throw error.parse({
      code    : 'BOOKING_AUTO_CANCEL_FAILED',
      message : 'Could not find a booking with the provided id'
    });
  }

  let car = yield Car.findById(booking.carId);

  if (booking.status === 'reserved') {
    if (RedisService.shouldProcess('booking-start', booking.id)) {
      // If a deploy happens during a cancel timer then it will happen once for each server ...
      if (RedisService.shouldProcess('booking-cancel', booking.id)) {
        if (booking.isFlagged('extended') && !booking.isFlagged('ext-started')) {
          yield booking.addFlag('ext-started');

          if(booking.isFlagged('extendinfinite')) {
            scheduler.add('booking-extension-reminder', {
              uid   : `booking-${ booking.id }`,
              timer : { value : 15, type  : 'minutes' },
              data  : {
                bookingId : booking.id
              }
            });
            yield notify.sendTextMessage(booking.userId, `Your reservation extension time has started! First 10 minutes are $1.00 and it's $0.30/min therafter until you get to the WaiveCar.`);
          } else {

            let timer = booking.isFlagged('extend20') ? config.booking.timers.extend20 : config.booking.timers.extend10;

            scheduler.add('booking-auto-cancel', {
              uid   : `booking-${ booking.id }`,
              timer : timer,
              data  : {
                bookingId : booking.id
              }
            });
            // tell the user that this is actually happening.
            yield notify.sendTextMessage(booking.userId, `Your reservation extension time has started! You have ${ timer.value } minutes more to get to ${ car.info() }.`);
          }

          // and then get out of here.
          return true;
        }

        yield BookingService.cancelBookingAndMakeCarAvailable(booking, car);

        // we derive the amount of time we gave them and assume it's divisible by 5 ... hopefully we are right.
        let timeWindow = Math.round((new Date() - booking.createdAt) / (5*60*1000)) * 5;

        let driver = yield User.findById(booking.userId);
        let aid = yield driver.hasTag('aid');

        let user = yield notify.sendTextMessage(booking.userId, `Sorry you didn't make it to ${car.info()} in ${ timeWindow }min. Never lose another car, reply "Save always". Rebook ${car.info()} for $5.00, reply "Rebook".`);
        yield notify.notifyAdmins(`:hourglass: The shambolic ${ user.link() } jilted ${ car.info() } and got cancelled after ${ timeWindow }min.`, [ 'slack' ], { channel : '#reservations' });

        // log.info(`The booking with ${ car.info() } was automatically cancelled, booking status was '${ booking.status }'.`);
      }
    } else {
      yield notify.notifyAdmins(`:timer_clock: ${ user.link() } started a booking exactly as their reservation time was expiring. This booking was granted. ${ car.info() }.`, [ 'slack' ], { channel : '#reservations' });
    }
  } else {
    log.warn(`Auto cancellation of booking ${ booking.id } was request but ignored | Booking status: ${ booking.status }`);
  }
});

module.exports = function *() {
  scheduler('booking-auto-cancel');
  scheduler('booking-auto-cancel-reminder');
};
