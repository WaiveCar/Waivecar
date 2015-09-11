'use strict';

module.exports = [
  {
    name    : 'BookingsList',
    type    : 'table',
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
    type    : 'form',
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
    type    : 'form',
    fields  : [ 'id', 'customerId', 'carId', 'paymentId', 'filesId', 'state' ],
    actions : {
      cancel : true,
      create : false,
      update : true,
      delete : true
    }
  }
];