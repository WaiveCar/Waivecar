'use strict';

// ### Cars Resource

Route.resource('cars', 'CarsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});

// ### Locations Resource

Route.resource('locations', 'LocationsController', {
  params : [ ] // no fields currently stored are updatable via resource.
});

// ### Booking Routes

Route.post('/bookings', {
  policy : ['authenticate'],
  params : ['carId'],
  uses   : 'BookingsController@create'
});

Route.get('/bookings',                                      'BookingsController@index');
Route.get('/bookings/:id',                 ['authenticate', 'BookingsController@show']);
Route.get('/bookings/:id/pending-arrival', ['authenticate', 'BookingsController@pendingArrival']);
Route.get('/bookings/:id/start',           ['authenticate', 'BookingsController@start']);
Route.get('/bookings/:id/end',             ['authenticate', 'BookingsController@end']);
Route.get('/bookings/:id/cancel',          ['authenticate', 'BookingsController@cancel']);