'use strict';

Route.post('/licenses/hooks', [ 'isOnfido', 'LicenseHooksController@catch' ]);

Route.post('/licenses', {
  policy : 'isAuthenticated',
  uses   : 'LicensesController@store',
  params : [ 'number', 'state' ]
});

Route.get('/licenses',     [ 'isAuthenticated', 'LicensesController@index' ]);
Route.get('/licenses/:id', [ 'isAuthenticated', 'LicensesController@show' ]);
Route.put('/licenses/:id', [ 'isAuthenticated', 'LicensesController@update' ]);
Route.del('/licenses/:id', [ 'isAuthenticated', 'LicensesController@delete' ]);

Route.post('/licenses/:id/verify', [ 'isAuthenticated', 'LicenseVerificationsController@store' ]);
Route.get('/licenses/:id/report',  [ 'isAuthenticated', 'LicenseVerificationsController@show' ]);
