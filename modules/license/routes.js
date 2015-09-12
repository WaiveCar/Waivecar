'use strict';

Route.pst('/licenses',     [ 'authenticate', 'LicensesController@store' ]);
Route.get('/licenses',     [ 'authenticate', 'LicensesController@index' ]);
Route.get('/licenses/:id', [ 'authenticate', 'LicensesController@show' ]);
Route.put('/licenses/:id', [ 'authenticate', 'LicensesController@update' ]);
Route.del('/licenses/:id', [ 'authenticate', 'LicensesController@destroy' ]);
