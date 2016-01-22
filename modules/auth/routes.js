'use strict';

Route.pst('/auth/login', {
  uses   : 'AuthController@login',
  params : [ 'identifier', 'password' ]
});

Route.pst('/auth/facebook', {
  uses   : 'AuthController@facebook',
  params : [ 'type', 'token', 'fields' ]
});

Route.get('/auth/remember', [ 'isAuthenticated', 'AuthController@remember' ]);
Route.get('/auth/validate', [ 'isAuthenticated', 'AuthController@validate' ]);
Route.get('/auth/logout',   [ 'isAuthenticated', 'AuthController@logout' ]);
