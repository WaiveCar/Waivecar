'use strict';

// ### Booking

Route.post('/bookings', {
  policy : 'isAuthenticated',
  uses   : 'BookingsController@create',
  params : [ 'userId', 'carId' ]
});

Route.get('/bookings',             [ 'isAuthenticated', 'BookingsController@index' ]);
Route.get('/bookings/:id',         [ 'isAuthenticated', 'BookingsController@show' ]);
Route.get('/bookings/:id/notes',   [ 'isAuthenticated', 'NotesController@getBookingNotes' ]);
Route.put('/bookings/:id/:action', [ 'isAuthenticated', 'BookingsController@update' ]);
Route.del('/bookings/:id',         [ 'isAuthenticated', 'BookingsController@cancel' ]);

// ### Patches

Route.put('/bookings/addressDetails', [ 'isAuthenticated', 'isAdmin', 'BookingsController@patchAddressDetails' ]);

// ### Problem Report

Route.post('/reports', {
  policy : 'isAuthenticated',
  uses   : 'ReportsController@create',
  params : [ 'bookingId', 'description' ]
});

Route.get('/reports', [ 'isAuthenticated', 'ReportsController@index' ]);

// ### Cars

Route.get('/cars',              [ 'CarsController@index' ]);
Route.get('/cars/:id',          [ 'CarsController@show' ]);
Route.get('/cars/:id/notes',    [ 'isAuthenticated', 'NotesController@getCarNotes' ]);
Route.get('/cars/:id/events',   [ 'isAuthenticated', 'CarsController@events' ]);
Route.put('/cars/:id/:command', [ 'isAuthenticated', 'CarsController@command' ]);
Route.put('/cars/:id',          [ 'isAuthenticated', 'CarsController@update' ]);

// ### Locations

Route.resource('locations', 'LocationsController');

// ### Notifications

Route.post('/notify', [ 'isAuthenticated', 'NotificationsController@send' ]);

// ### Sms Handlers

Route.get('/sms', [ 'SmsController@response' ]);

// ### Contact Handlers

Route.post('/contact', [ 'isAuthenticated', 'ContactController@send' ]);

// ### Notes Handlers

Route.post('/notes/:type', [ 'isAuthenticated', 'isAdmin', 'NotesController@add' ]);
Route.get('/notes/:type/:id', [ 'isAuthenticated', 'NotesController@show' ]);
Route.put('/notes/:type/:id', [ 'isAuthenticated', 'isAdmin', 'NotesController@update' ]);
Route.del('/notes/:type/:id', [ 'isAuthenticated', 'isAdmin', 'NotesController@remove' ]);

Route.get('/users/:id/notes',   [ 'isAuthenticated', 'NotesController@getUserNotes' ]);

// ### Log Handlers
Route.post('/audit/log', [ 'isAuthenticated', 'isAdmin', 'LogController@create' ]);
Route.get('/audit/log', [ 'isAuthenticated', 'isAdmin', 'LogController@index' ]);

// ### Geocoding Handlers
Route.get('/geocoding', [ 'isAuthenticated', 'GeocodingController@show' ]);
