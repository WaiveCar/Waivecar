'use strict';

// ### Resources

Route.resource('cars',      'CarsController');
Route.resource('locations', 'LocationsController');

// ### Booking Routes

Route.post('/bookings', {
  policy : [ 'authenticate' ],
  params : [ 'carId' ],
  uses   : 'BookingsController@create'
});

Route.get('/bookings',                      'BookingsController@index');
Route.get('/bookings/:id', ['authenticate', 'BookingsController@show']);
Route.put('/bookings/:id', ['authenticate', 'BookingsController@update']);