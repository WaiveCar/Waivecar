'use strict';

Route.post('/licenses', {
  policy : 'isAuthenticated',
  uses   : 'LicensesController@store',
  params : [ 'firstName', 'lastName', 'birthDate', 'number', 'state' ]
});

Route.get('/licenses',     [ 'isAuthenticated', 'LicensesController@index' ]);
Route.get('/licenses/:id', [ 'isAuthenticated', 'LicensesController@show' ]);
Route.put('/licenses/:id', [ 'isAuthenticated', 'LicensesController@update' ]);
Route.del('/licenses/:id', [ 'isAuthenticated', 'LicensesController@delete' ]);

Route.post('/licenses/:id/verify', [ 'isAuthenticated', 'LicenseVerificationsController@store' ]);
