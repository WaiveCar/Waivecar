'use strict';

var Router = Reach.Router;

// ### Cars Resource

Router.resource('cars', 'CarsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});

// ### Locations Resource

Router.resource('locations', 'LocationsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});

// ### Booking Routes

Router.post('/bookings', {
  policy : ['authenticate'],
  params : ['carId'],
  uses   : 'BookingsController@create'
});

Router.get('/bookings/:id/pending-arrival', {
  policy : ['authenticate'],
  uses   : 'BookingsController@pendingArrival'
});

Router.get('/bookings/:id/start', {
  policy : ['authenticate'],
  uses   : 'BookingsController@start'
});

Router.get('/bookings/:id/cancel', {
  policy : ['authenticate'],
  uses   : 'BookingsController@cancel'
});