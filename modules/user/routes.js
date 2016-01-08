'use strict';

let config = Bento.config.user;

// ### Unique Routes

Route.get('/users/me',             'UsersController@me');
Route.put('/reset-password',       'UsersController@passwordReset');
Route.pst('/reset-password/token', 'UsersController@passwordToken');

// ### User Resource

Route.resource('users', 'UsersController', {
  params : config.params ? config.params : null
});