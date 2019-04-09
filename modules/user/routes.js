'use strict';

let config = Bento.config.user;

Route.get('/users/me',             'UsersController@me');
Route.get('/users/inter',             'UsersController@intercom');
Route.put('/users/tags/:verb/:tag','UsersController@tag');
Route.put('/reset-password',       'UsersController@passwordReset');
Route.pst('/reset-password/token', 'UsersController@passwordToken');
Route.put('/set-password-admin/:id',   [ 'isAuthenticated', 'isAdmin', 'UsersController@passwordSetAdmin']);

Route.resource('users', 'UsersController', {
  params : config.params ? config.params : null
});

Route.get('/users/:id/stats', [ 'isAuthenticated', 'isAdmin', 'UsersController@stats']);
