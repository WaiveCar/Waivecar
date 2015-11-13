'use strict';

Route.post('/licenses', {
  policy :  [ 'authenticate' ],
  uses   : 'LicensesController@store',
  params : [ 'number', 'firstName', 'lastName', 'birthDate', 'country', 'state' ]
});

Route.get('/licenses',     [ 'authenticate', 'LicensesController@index' ]);
Route.get('/licenses/:id', [ 'authenticate', 'LicensesController@show' ]);
Route.put('/licenses/:id', [ 'authenticate', 'LicensesController@update' ]);
Route.del('/licenses/:id', [ 'authenticate', 'LicensesController@delete' ]);
