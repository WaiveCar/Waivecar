'use strict';

Route.post   ('/licenses',     [ 'authenticate', 'LicensesController@create' ]);
Route.get    ('/licenses',     [ 'authenticate', 'LicensesController@index' ]);
Route.get    ('/licenses/:id', [ 'authenticate', 'LicensesController@show' ]);
Route.put    ('/licenses/:id', [ 'authenticate', 'LicensesController@update' ]);
Route.delete ('/licenses/:id', [ 'authenticate', 'LicensesController@cancel' ]);
