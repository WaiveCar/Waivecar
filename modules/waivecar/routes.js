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
Route.put('/bookings/:id/flags',   [ 'isAuthenticated', 'isAdmin', 'BookingsController@flags' ]);
Route.get('/bookings/:id/notes',   [ 'isAuthenticated', 'NotesController@getBookingNotes' ]);
Route.get('/bookings/:id/parkingDetails',   [ 'isAuthenticated', 'BookingsController@getParkingDetails' ]);
Route.put('/bookings/:id/checkParity', [ 'isAuthenticated', 'BookingsController@checkCarParityWithUser' ]);
Route.put('/bookings/:id/:time?/extendForFree', [ 'isAuthenticated', 'isAdmin', 'BookingsController@extendForFree' ]);
Route.put('/bookings/:id/:action', [ 'isAuthenticated', 'BookingsController@update' ]);
Route.del('/bookings/:id',         [ 'isAuthenticated', 'BookingsController@cancel' ]);
Route.get('/bookingsFixTikd',        [ 'BookingsController@fixTikd' ]);
Route.get('/bookingsCount',        [ 'isAuthenticated', 'BookingsController@count' ]);
Route.get('/bookingsUserContribution/:id', ['BookingsController@userContribution' ]);
Route.get('/waiveworkPayment/calculateProratedCharge', [ 'isAuthenticated', 'BookingsController@calculateProratedCharge' ]);
Route.post('/waiveworkPayment/:bookingId/failedPayment', [ 'isAuthenticated', 'BookingsController@failedWaiveworkPayment' ]);
Route.put('/waiveworkPayment/:bookingId', [ 'isAuthenticated', 'BookingsController@updateWaiveworkPayment' ]);

// ### Patches

Route.put('/bookings/addressDetails', [ 'isAuthenticated', 'isAdmin', 'BookingsController@patchAddressDetails' ]);

// ### Problem Report

Route.post('/reports', {
  policy : 'isAuthenticated',
  uses   : 'ReportsController@create',
  params : [ 'bookingId' ]
});

Route.get('/reports/mileage/:date', [ 'ReportsController@showMileage' ]);
Route.get('/reports/mileage', [ 'ReportsController@showMileage' ]);
Route.get('/reports/goodyear/:date', [ 'ReportsController@goodyear' ]);
Route.get('/reports/goodyear', [ 'ReportsController@goodyear' ]);
Route.get('/reports/car/:id', [ 'ReportsController@showForCar' ]);
Route.del('/reports/:id', [ 'isAuthenticated', 'isAdmin', 'ReportsController@delete' ]);


// ### Airtable Related
Route.get('/airtable/users', [ 'isAuthenticated', 'CarsController@airtableUsers' ]);
Route.get('/airtable/refresh', [ 'isAuthenticated', 'CarsController@refreshAirtable' ]);
Route.post('/airtable/createTicket', [ 'isAuthenticated', 'CarsController@createAirtableTicket' ]);

// ### Cars
Route.get('/unassignedTelematics',   [ 'CarsController@unassignedTelems' ]);

Route.get('/cars',              [ 'CarsController@index' ]);
Route.post('/cars/batch/:action',[ 'isAuthenticated', 'CarsController@batch' ]);
Route.get('/cars/stats',        [ 'CarsController@stats', 'isAuthenticated' ]);
Route.get('/cars/search',       [ 'isAuthenticated', 'CarsController@search' ]);
Route.get('/carsWithBookings',  [ 'isAdmin', 'CarsController@carsWithBookings' ]);
Route.put('/magic/:command',    [ 'isAuthenticated', 'isAdmin', 'CarsController@magic' ]);
Route.get('/cars/:id',          [ 'isAuthenticated', 'CarsController@show' ]);
Route.get('/cars/:id/notes',    [ 'isAuthenticated', 'NotesController@getCarNotes' ]);
Route.get('/cars/:id/history',  [ 'isAuthenticated', 'CarsController@history' ]);
Route.get('/cars/:id/events',   [ 'isAuthenticated', 'CarsController@events' ]);
Route.get('/cars/:id/bookings', [ 'isAuthenticated', 'CarsController@bookings' ]);
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

// User Parking
Route.post('/parkingQuery', [ 'ParkingController@parkingQuery' ]);
Route.post('/parking/cite/:adjective', [ 'BookingsController@signIssue' ]);

// WaiveParking
Route.get('/parking', ['isAuthenticated', 'ParkingController@index' ]);
Route.post('/parking', [ 'isAuthenticated', 'ParkingController@create' ]);
Route.get('/parking/:id', ['isAuthenticated', 'ParkingController@show' ]);
Route.get('/parking/users/:userId', [ 'isAuthenticated', 'ParkingController@getByUser' ]);
Route.get('/parking/locations/:locationId', [ 'isAuthenticated', 'ParkingController@findByLocation' ]);
Route.get('/parking/fetchReservation/:userId', [ 'isAuthenticated', 'ParkingController@fetchReservation' ]);
Route.del('/parking/:id', [ 'isAuthenticated', 'ParkingController@delete' ]);
Route.put('/parking/:id/toggle/:type', [ 'isAuthenticated', 'ParkingController@toggle' ]);
Route.put('/parking/:id/update', [ 'isAuthenticated', 'ParkingController@updateParking' ]);
Route.post('/parking/:id/reserve', [ 'isAuthenticated', 'ParkingController@reserve' ]);
Route.put('/parking/:id/occupy', [ 'isAuthenticated', 'ParkingController@occupy' ]);
Route.put('/parking/:id/cancel', [ 'isAuthenticated', 'ParkingController@cancel' ]);
Route.put('/parking/vacate/:carId', [ 'isAuthenticated', 'ParkingController@vacate' ]);

Route.put('/chargers/start/:id/:charger', [ 'isAuthenticated', 'ChargersController@start' ]);
Route.get('/chargers/list', 'ChargersController@chargers');


// ### Notifications

Route.post('/notify', [ 'isAuthenticated', 'NotificationsController@send' ]);
Route.post('/refresh-device-token', [ 'isAuthenticated', 'NotificationsController@refreshDeviceToken' ]);
Route.get('/send-test-push/:id', 'NotificationsController@sendTestPush');


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
Route.get('/insuranceQuotes', ['isAuthenticated', 'isAdmin', 'WaitlistController@insuranceQuotes']);
Route.post('/waitlist/letIn', [ 'isAuthenticated', 'isAdmin', 'WaitlistController@letIn' ]);
Route.post('/waitlist/FBletIn', [ 'isAuthenticated', 'isAdmin', 'WaitlistController@FBletIn' ]);
Route.post('/waitlist/add', ['WaitlistController@add' ]);
Route.post('/waitlist/addNote', ['WaitlistController@addNote' ]);
Route.post('/waitlist/deleteNote', ['WaitlistController@deleteNote']);
Route.post('/waitlist/prioritize', ['WaitlistController@prioritize' ]);
Route.post('/waitlist/addById', ['WaitlistController@addById' ]);
Route.post('/waitlist/waiveWorkEmail', ['WaitlistController@waiveWorkEmail'])
Route.post('/waitlist/requestWorkQuote', ['WaitlistController@requestWorkQuote'])

Route.get('/actions/hash/:id', ['ActionController@getHash']);
Route.get('/actions/forward/:type/:id', ['ActionController@goForward']);
Route.get('/actions/current/:type/:id', ['ActionController@getAction']);

// ### Geocoding Handlers
Route.get('/geocoding', [ 'isAuthenticated', 'GeocodingController@show' ]);

Route.get('/dashboard', [ /* 'isAuthenticated', 'isAdmin',*/ 'DashboardController@index' ]);

// ### Group
Route.get('/group', ['GroupController@index']);
Route.post('/group', ['GroupController@create']);
Route.put('/group/:id', ['GroupController@update']);
Route.del('/group/:id', ['GroupController@delete']);
Route.post('/group/:groupRoleId/assigncar/:carId', ['GroupController@assignCar']);
Route.del('/group/:groupRoleId/removecar/:carId', ['GroupController@removeCar']);

// ### Organizations
Route.get('/organizations', ['OrganizationsController@index']);
Route.post('/organizations', ['isAuthenticated', 'OrganizationsController@create']);
Route.post('/organizations/statements', ['isAuthenticated', 'OrganizationsController@createStatement']);
Route.post('/organizations/addUser', ['isAuthenticated', 'OrganizationsController@addUser']);
Route.get('/organizations/:id', ['isAuthenticated','OrganizationsController@show']);
Route.put('/organizations/:id/:action', ['isAuthenticated', 'OrganizationsController@action']);
Route.get('/organizations/:id/statements', ['isAuthenticated', 'OrganizationsController@getStatements']);
