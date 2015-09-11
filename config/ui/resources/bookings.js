'use strict';

module.exports = {
  name  : 'bookings',
  store : {
    key    : 'booking',
    method : 'POST',
    uri    : '/bookings'
  },
  index : {
    key    : 'bookings',
    method : 'GET',
    uri    : '/bookings'
  },
  show : {
    key    : 'booking',
    method : 'GET',
    uri    : '/bookings/:id'
  },
  update : {
    key    : 'booking',
    method : 'PUT',
    uri    : '/bookings/:id'
  },
  delete : {
    key    : 'booking',
    method : 'DELETE',
    uri    : '/bookings/:id'
  }
};