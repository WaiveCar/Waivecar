'use strict';

// ### Booking

Route.post('/bookings', {
  policy : 'isAuthenticated',
  uses   : 'BookingsController@create',
  params : [ 'userId', 'carId' ]
});

//Route.get('/status',               [ 'isAuthenticated', 'ReportsController@status' ]);
Route.get('/status',               [ 'ReportsController@status' ]);
Route.get('/ping',                 [ 'CarsController@ping' ]);

Route.get('/history',              [ 'LogController@index' ]);
Route.get('/history/car/:id',      [ 'LogController@carHistory' ]);
Route.get('/history/booking/:id',  [ 'LogController@bookingHistory' ]);

Route.get('/bookings',             [ 'isAuthenticated', 'BookingsController@index' ]);
Route.get('/bookings/:id',         [ 'isAuthenticated', 'BookingsController@show' ]);
Route.get('/bookings/:id/notes',   [ 'isAuthenticated', 'NotesController@getBookingNotes' ]);
Route.put('/bookings/:id/checkParity', [ 'isAuthenticated', 'BookingsController@checkCarParityWithUser' ]);
Route.put('/bookings/:id/:action', [ 'isAuthenticated', 'BookingsController@update' ]);
Route.del('/bookings/:id',         [ 'isAuthenticated', 'BookingsController@cancel' ]);
Route.get('/bookingsCount',        [ 'isAuthenticated', 'BookingsController@count' ]);

// ### Patches

Route.put('/bookings/addressDetails', [ 'isAuthenticated', 'isAdmin', 'BookingsController@patchAddressDetails' ]);

// ### Problem Report

Route.post('/reports', {
  policy : 'isAuthenticated',
  uses   : 'ReportsController@create',
  params : [ 'bookingId' ]
});

Route.get('/reports', [ 'isAuthenticated', 'ReportsController@index' ]);
Route.get('/reports/car/:id', [ 'ReportsController@showForCar' ]);
Route.del('/reports/:id', [ 'isAuthenticated', 'isAdmin', 'ReportsController@delete' ]);



// ### Cars

Route.get('/cars',              [ 'CarsController@index' ]);
Route.get('/carsWithBookings',  [ 'isAuthenticated', 'isAdmin', 'CarsController@carsWithBookings' ]);
Route.get('/cars/:id',          [ 'isAuthenticated', 'CarsController@show' ]);
Route.get('/cars/:id/notes',    [ 'isAuthenticated', 'NotesController@getCarNotes' ]);
Route.get('/cars/:id/events',   [ 'isAuthenticated', 'CarsController@events' ]);
Route.get('/cars/:id/:command', [ 'isAuthenticated', 'CarsController@command' ]);
Route.put('/cars/:id/:command', [ 'isAuthenticated', 'CarsController@command' ]);
Route.put('/cars/:id',          [ 'isAuthenticated', 'CarsController@update' ]);

// ### Locations

Route.post('/locations', [ 'isAuthenticated', 'isAdmin', 'LocationsController@create'])

Route.get('/locations', 'LocationsController@index');
Route.get('/locations/:id', 'LocationsController@show');
Route.put('/locations/:id', [ 'isAuthenticated', 'isAdmin', 'LocationsController@update' ]);
Route.del('/locations/:id', [ 'isAuthenticated', 'isAdmin', 'LocationsController@delete' ]);

Route.get('/locations/dropoff', 'LocationsController@dropoff');


// ### Notifications

Route.post('/notify', [ 'isAuthenticated', 'NotificationsController@send' ]);

// ### Sms Handlers

Route.get('/sms', 'ContactController@sms');
Route.post('/contact', [ 'isAuthenticated', 'ContactController@send' ]);

// ### Notes Handlers

Route.post('/notes/:type', [ 'isAuthenticated', 'isAdmin', 'NotesController@add' ]);
Route.get('/notes/:type/:id', [ 'isAuthenticated', 'NotesController@show' ]);
Route.put('/notes/:type/:id', [ 'isAuthenticated', 'isAdmin', 'NotesController@update' ]);
Route.del('/notes/:type/:id', [ 'isAuthenticated', 'isAdmin', 'NotesController@remove' ]);

Route.get('/users/:id/notes',   [ 'isAuthenticated', 'NotesController@getUserNotes' ]);

Route.post('/audit/log', [ 'isAuthenticated', 'isAdmin', 'LogController@create' ]);
Route.get('/audit/log', [ 'isAuthenticated', 'isAdmin', 'LogController@index' ]);

Route.get('/tickets', [ 'isAuthenticated', 'isAdmin', 'TicketController@index' ]);
Route.post('/tickets', [ 'isAuthenticated', 'isAdmin', 'TicketController@create' ]);
Route.post('/tickets/:id/:action', [ 'isAuthenticated', 'isAdmin', 'TicketController@update' ]);

Route.get('/waitlist', [ 'isAuthenticated', 'isAdmin', 'WaitlistController@index' ]);
Route.post('/waitlist/letIn', [ 'isAuthenticated', 'isAdmin', 'WaitlistController@letIn' ]);
Route.post('/waitlist/add', ['WaitlistController@add' ]);
Route.post('/waitlist/addById', ['WaitlistController@addById' ]);

Route.get('/actions/hash/:id', ['ActionController@getHash']);
Route.get('/actions/:type/:id', ['ActionController@getAction']);

// ### Geocoding Handlers
Route.get('/geocoding', [ 'isAuthenticated', 'GeocodingController@show' ]);

Route.get('/dashboard', [ /* 'isAuthenticated', 'isAdmin',*/ 'DashboardController@index' ]);
