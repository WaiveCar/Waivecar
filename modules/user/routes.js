'use strict';

let config = Bento.config.user;

// ### Unique Routes

Route.get('/users/me',             'UsersController@me');
Route.put('/reset-password',       'UsersController@passwordReset');
Route.pst('/reset-password/token', 'UsersController@passwordToken');
Route.put('/set-password-admin/:id',   [ 'isAuthenticated', 'isAdmin', 'UsersController@passwordSetAdmin']);

// ### User Resource

Route.resource('users', 'UsersController', {
  params : config.params ? config.params : null
});

Route.get('/users/:id/stats', [ /*'isAuthenticated', 'isAdmin'*/ 'UsersController@stats']);
