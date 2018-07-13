'use strict';

let notify    = require('../../lib/notification-service');
let scheduler = Bento.provider('queue').scheduler;
let Booking   = Bento.model('Booking');
let Car       = Bento.model('Car');
let log       = Bento.Log;
let relay     = Bento.Relay;
let error     = Bento.Error;
let config    = Bento.config.waivecar;
let RedisService   = require('../../lib/redis-service');


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
  let booking = yield Booking.findOne({ where : { id : job.data.bookingId } });
  let car = yield Car.findById(booking.carId);

  if(booking && booking.status === 'reserved' && !booking.isFlagged('extended')) {
    yield notify.sendTextMessage(booking.userId, `${car.info()} reservation time is almost up! Need more time? Respond "SAVE" to pay $4.20 for 20 extra minutes, "SAVE LESS" for $1.00 for 10 extra minutes, and "ABORT" to cancel the booking.`);
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
      if (booking.isFlagged('extended') && !booking.isFlagged('ext-started')) {
        yield booking.addFlag('ext-started');
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

        // and then get out of here.
        return true;
      }

      yield booking.update({
        status : 'cancelled'
      });

      // ### Update Car
      // Remove the user from the car and make it available again.
      yield car.update({
        userId      : null,
        isAvailable : true
      });

      // ### Emit Event
      // Sends the cancelled event to the user and administrators.

      relay.user(booking.userId, 'bookings', {
        type : 'update',
        data : booking.toJSON()
      });

      relay.admin('bookings', {
        type : 'update',
        data : booking.toJSON()
      });

      let timeWindow = booking.isFlagged('level') ? config.booking.timers.level.autoCancel.value : config.booking.timers.autoCancel.value;
      timeWindow = parseInt(timeWindow, 10);

      if(booking.isFlagged('extended')) {
        timeWindow += 10;
      }

      let user = yield notify.sendTextMessage(booking.userId, `Hi, sorry you couldn't make it to your car on time. Your ${ timeWindow } minutes have expired and we've had to cancel your reservation for ${ car.info() }`);
      yield notify.notifyAdmins(`:timer_clock: ${ user.name() }, ${ car.info() } booking cancelled after ${ timeWindow } minute timer expiration.`, [ 'slack' ], { channel : '#reservations' });

      log.info(`The booking with ${ car.info() } was automatically cancelled, booking status was '${ booking.status }'.`);
    } else {
      yield notify.notifyAdmins(`:timer_clock: ${ user.name() } started a booking when it was being canceled. This was granted. ${ car.info() }.`, [ 'slack' ], { channel : '#reservations' });
    }
  } else {
    log.warn(`Auto cancellation of booking ${ booking.id } was request but ignored | Booking status: ${ booking.status }`);
  }
});

module.exports = function *() {
  scheduler('booking-auto-cancel');
  scheduler('booking-auto-cancel-reminder');
};
