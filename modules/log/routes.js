
Route.post('/logs/:type', {
  policy : 'isAuthenticated',
  uses   : 'LogsController@create',
  params : [ 'origin' ]
});

Route.get('/stats/:day',     [ 'LogsController@stats' ]);
Route.get('/revenue/:start/:end',     [ 'LogsController@revenue' ]);
Route.get('/revenue',     [ 'LogsController@revenue' ]);
Route.get('/report/:year_month/:type',     [ 'LogsController@report' ]);
Route.get('/logs/:type',     [ 'isAuthenticated', 'LogsController@index' ]);
Route.get('/logs/:type/:id', [ 'isAuthenticated', 'LogsController@show' ]);
Route.put('/logs/:type/:id', [ 'isAuthenticated', 'LogsController@update' ]);
Route.del('/logs/:type/:id', [ 'isAuthenticated', 'LogsController@resolve' ]);
