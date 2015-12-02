'use strict';

// ### Booking

Route.post('/bookings', {
  policy : 'isAuthenticated',
  uses   : 'BookingsController@create',
  params : [ 'userId', 'carId' ]
});

Route.get('/bookings',           [ 'isAuthenticated', 'BookingsController@index' ]);
Route.get('/bookings/:id',       [ 'isAuthenticated', 'BookingsController@show' ]);
Route.put('/bookings/start/:id', [ 'isAuthenticated', 'BookingsController@start' ]);
Route.put('/bookings/end/:id',   [ 'isAuthenticated', 'BookingsController@end' ]);
Route.del('/bookings/:id',       [ 'isAuthenticated', 'BookingsController@cancel' ]);

// ### DEPRECATED UPDATE!

Route.put('/bookings/:id/start', [ 'isAuthenticated', 'BookingsController@start' ]);
Route.put('/bookings/:id/end',   [ 'isAuthenticated', 'BookingsController@end' ]);

// ### Cars

Route.get('/cars',              [ 'CarsController@index' ]);
Route.get('/cars/:id',          [ 'CarsController@show' ]);
Route.get('/cars/:id/events',   [ 'isAuthenticated', 'CarsController@events' ]);
Route.put('/cars/:id/:command', [ 'isAuthenticated', 'CarsController@update' ]);

// ### Locations

Route.resource('locations', 'LocationsController');
