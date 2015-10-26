'use strict';

let Booking        = Reach.model('Booking');
let BookingPayment = Reach.model('BookingPayment');
let Payment        = Reach.model('Payment');
let hooks          = Reach.Hooks;
let error          = Reach.Error;

/*
  Prepare provided customer data, this hook is reuquired by the customer service
  and acts as a filter to make sure that unwanted data is not being processed.
  This is also where you can prepare back end driven data.
  
  @param {String} type The type of customer interaction, create, or update.
  @param {Object} data
 */
hooks.set('payment:customer', function *(type, data) {
  return {
    description  : data.description,
    subscription : data.subscription,
    metadata     : data.metadata 
  }
});

/*
  Validates a payment request before attempting to charge a customer.
  @param {Object} data
 */
hooks.set('payment:validate', function *(data) {
  switch (data.type) {
    case 'booking' : {
      yield validateBooking(data.bookingId);
      break;
    }
  }
});

/*
  Executes when a charge has been authorized for two-step payments.
  @param {Object} data
  @param {Object} payment
 */
hooks.set('payment:authorized', function *(data, payment) {
  switch (data.type) {
    case 'booking' : {
      yield authorizeBooking(data.bookingId, payment);
      break;
    }
  }
});

/*
  Executes when a charge has been successfully processed.
  @param  {Object} data
  @param  {Object} payment
 */
hooks.set('payment:paid', function *(data, payment) {
  // ... 
});

// ### Methods

/**
 * Validate the booking with the provided id.
 * @param {Number} id
 */
function *validateBooking(id) {
  let booking = yield Booking.findById(id);
  if (!booking) {
    throw error.parse({
      code    : `BOOKING_NOT_FOUND`,
      message : `The booking for this payment request does not exist.`
    }, 400);
  }
}

/**
 * Update the booking with the authorized payment status.
 * @param {Number} id
 * @param {Object} payment
 */
function *authorizeBooking(id, payment) {

  // ### Update Booking

  let booking = yield Booking.findById(id);
  yield booking.update({
    status : 'payment-authorized'
  });
  
  // ### Create Payment

  let bookingPayment = new BookingPayment({
    bookingId : booking.id,
    paymentId : payment.id
  });
  yield bookingPayment.save();
  
}