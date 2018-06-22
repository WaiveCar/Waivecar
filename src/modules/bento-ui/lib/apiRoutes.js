module.exports = {
  'bookings': {
    delete: {key: 'booking', method: 'DELETE', uri: '/bookings/:id'},
    index: {key: 'bookings', method: 'GET', uri: '/bookings'},
    name: 'bookings',
    show: {key: 'booking', method: 'GET', uri: '/bookings/:id'},
    store: {key: 'booking', method: 'POST', uri: '/bookings'}, 
    update: {key: 'booking', method: 'PUT', uri: '/bookings/:id'},
  },
  /*
  'cards': {
    delete: {key: 'card', method: 'DELETE', uri: '/cards/:id'},
    index: {key: 'cards', method: 'GET', uri: '/cards'},
    name: 'cards',
    show: {key: 'card', method: 'GET', uri: '/cards/:id'},
    store: {key: 'card', method: 'POST', uri: '/cards'},
    update: {key: 'card', method: 'PUT', uri: '/cards/:id'},
  },
  'cars': {
    delete: {key: 'car', method: 'DELETE', uri: '/cars/:id'},
    index: {key: 'cars', method: 'GET', uri: '/cars?limit=100'},
    name: 'cars',
    show: {key: 'car', method: 'GET', uri: '/cars/:id'},
    store: {key: 'car', method: 'POST', uri: '/cars'},
    update: {key: 'car', method: 'PUT', uri: '/cars/:id'}
  },
  'files': {
    delete: {method: 'DELETE', uri: '/files/:id'},
    index: {method: 'GET', uri: '/files'},
    name: 'files',
    show: {method: 'GET', uri: '/files/:id'},
    store: {method: 'POST', uri: '/files'},
    update: {method: 'PUT', uri: '/files/:id'},
  },
  'licenses': {
    delete: {key: 'license', method: 'DELETE', uri: '/licenses/:id'},
    index: {key: 'licenses', method: 'GET', uri: '/licenses'},
    name: 'licenses',
    show: {key: 'license', method: 'GET', uri: '/licenses/:id'},
    store: {key: 'license', method: 'POST', uri: '/licenses'},
    update: {key: 'license', method: 'PUT', uri: '/licenses/:id'},
  },
  'locations': {
    delete: {key: 'location', method: 'DELETE', uri: '/locations/:id'},
    index: {key: 'locations', method: 'GET', uri: '/locations'},
    name: 'locations',
    show: {key: 'location', method: 'GET', uri: '/locations/:id'},
    store: {key: 'location', method: 'POST', uri: '/locations'},
    update: {key: 'location', method: 'PUT', uri: '/locations/:id'},
  },
  */
  'users': {
    delete: {method: 'DELETE', uri: '/users/:id'},
    index: {method: 'GET', uri: '/users'},
    name: 'users',
    show: {method: 'GET', uri: '/users/:id'},
    store: {method: 'POST', uri: '/users'},
    update: {method: 'PUT', uri: '/users/:id'},
  }
};
