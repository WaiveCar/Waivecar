'use strict';

Route.post('/licenses/hooks', 'LicenseHooksController@catch');

Route.post('/licenses', {
  policy : [ 'authenticate' ],
  uses   : 'LicensesController@store',
  params : [ 'firstName', 'lastName', 'birthDate', 'number', 'state' ]
});

Route.get('/licenses',     [ 'authenticate', 'LicensesController@index' ]);
Route.get('/licenses/:id', [ 'authenticate', 'LicensesController@show' ]);
Route.put('/licenses/:id', [ 'authenticate', 'LicensesController@update' ]);
Route.del('/licenses/:id', [ 'authenticate', 'LicensesController@delete' ]);

Route.post('/licenses/:id/verify', [ 'authenticate', 'LicenseVerificationsController@store' ]);
Route.get('/licenses/:id/report', [ 'authenticate', 'LicenseVerificationsController@show' ]);
