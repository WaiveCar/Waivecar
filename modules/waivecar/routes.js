'use strict';

// ### Booking Routes

Route.pst('/bookings',           [ 'authenticate', 'BookingsController@create' ]);
Route.get('/bookings',           [ 'authenticate', 'BookingsController@index' ]);
Route.get('/bookings/:id',       [ 'authenticate', 'BookingsController@show' ]);
Route.put('/bookings/:id/start', [ 'authenticate', 'BookingsController@start' ]);
Route.put('/bookings/:id/end',   [ 'authenticate', 'BookingsController@end' ]);
Route.del('/bookings/:id',       [ 'authenticate', 'BookingsController@destroy' ]);

// ### Resources

Route.resource('cars',      'CarsController');
Route.resource('locations', 'LocationsController');