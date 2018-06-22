module.exports = {
  'bookings': {
    delete: {key: 'booking', method: 'DELETE', uri: '/bookings/:id'},
    index: {key: 'bookings', method: 'GET', uri: '/bookings'},
    name: 'bookings',
    show: {key: 'booking', method: 'GET', uri: '/bookings/:id'},
    store: {key: 'booking', method: 'POST', uri: '/bookings'}, 
    update: {key: 'booking', method: 'PUT', uri: '/bookings/:id'},
  },
  'users': {
    delete: {method: 'DELETE', uri: '/users/:id'},
    index: {method: 'GET', uri: '/users'},
    name: 'users',
    show: {method: 'GET', uri: '/users/:id'},
    store: {method: 'POST', uri: '/users'},
    update: {method: 'PUT', uri: '/users/:id'},
  }
};
