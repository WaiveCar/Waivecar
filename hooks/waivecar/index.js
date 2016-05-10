'use strict';

let hooks = Bento.Hooks;
let bookings = Bento.module('waivecar/lib/booking-service');
let Booking = Bento.model('Booking');

hooks.set('cars:show:after', function *(payload) {
  let booking = yield Booking.findOne({
    where : {
      carId  : payload.id,
      status : [ 'completed', 'closed', 'ended' ]
    },
    order : [
      [ 'created_at', 'DESC' ]
    ]
  });

  if (booking) payload.lastBooking = yield bookings.show(booking.id, null, true);
  return payload;
});
