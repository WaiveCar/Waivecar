'use strict';

// ### Booking Create

Route.post('/bookings', {
  policy : 'authenticate',
  uses   : 'BookingsController@create',
  params : [ 'carId', 'userId' ]
});

// ### Booking Read

Route.get('/bookings',     [ 'authenticate', 'BookingsController@index' ]);
Route.get('/bookings/:id', [ 'authenticate', 'BookingsController@show' ]);

// ### Booking Update

Route.put('/bookings/:id/start', [ 'authenticate', 'BookingsController@start' ]);
Route.put('/bookings/:id/end', {
  policy : 'authenticate',
  uses   : 'BookingsController@end',
  params : [ 'paymentId' ]
});

// ### Booking Delete

Route.del('/bookings/:id', [ 'authenticate', 'BookingsController@cancel' ]);

// ### Resources

Route.get('/cars',              [ 'CarsController@index' ]);
Route.get('/cars/:id',          [ 'CarsController@show' ]);
Route.get('/cars/:id/events',   [ 'authenticate', 'CarsController@events' ]);
Route.put('/cars/:id/:command', [ 'authenticate', 'CarsController@update' ]);

Route.resource('locations', 'LocationsController');
