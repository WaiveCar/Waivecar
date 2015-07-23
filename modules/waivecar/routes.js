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

Router.get('/bookings/:id',                 ['authenticate', 'BookingsController@show']);
Router.get('/bookings/:id/pending-arrival', ['authenticate', 'BookingsController@pendingArrival']);
Router.get('/bookings/:id/start',           ['authenticate', 'BookingsController@start']);
Router.get('/bookings/:id/end',             ['authenticate', 'BookingsController@end']);
Router.get('/bookings/:id/cancel',          ['authenticate', 'BookingsController@cancel']);