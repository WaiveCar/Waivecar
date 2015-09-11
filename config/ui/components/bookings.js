'use strict';

module.exports = [
  {
    name    : 'BookingsList',
    title   : 'Bookings',
    type    : 'Table',
    fields  : [ 'id', 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
    actions : {
      cancel : true,
      create : true,
      update : true,
      delete : true
    }
  },
  {
    name    : 'BookingsCreate',
    title   : 'Add Booking',
    type    : 'Form',
    fields  : [ 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
    actions : {
      cancel : true,
      create : true,
      update : false,
      delete : false
    }
  },
  {
    name    : 'BookingsShow',
    title   : 'Booking',
    type    : 'Form',
    fields  : [ 'id', 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  },
  {
    name    : 'BookingsChart',
    title   : 'Bookings',
    type    : 'MiniChart',
    fields  : [ 'id', 'createdAt' ],
    actions : {
      cancel : false,
      create : false,
      update : false,
      delete : false
    }
  }
];