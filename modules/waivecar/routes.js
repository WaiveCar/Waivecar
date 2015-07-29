'use strict';

// ### Resources

Route.resource('cars',      'CarsController');
Route.resource('locations', 'LocationsController');

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