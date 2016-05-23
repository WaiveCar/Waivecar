'use strict';

let hooks = Bento.Hooks;
let Booking = Bento.model('Booking');
let ParkingDetails = Bento.model('ParkingDetails');

hooks.set('cars:show:after', function *(payload) {
  let bookings = yield Booking.find({
    where : {
      carId  : payload.id,
      status : {
        $in : [ 'completed', 'closed', 'ended' ]
      }
    },
    include : [
      {
        model : 'BookingDetails',
        as    : 'details'
      },
      {
        model      : 'BookingPayment',
        as         : 'payments',
        attributes : [ 'orderId' ]
      }
    ]
  });

  if (bookings && bookings.length) {
    let booking = bookings[0];
    if (booking.details && booking.details.length) {
      for (let i = 0, len = booking.details.length; i < len; i++) {
        let detail = booking.details[i];
        detail.parkingDetails = yield ParkingDetails.findOne({ where : { bookingDetailId : detail.id } });
      }
    }
    payload.lastBooking = booking;
  }

  return payload;
});
