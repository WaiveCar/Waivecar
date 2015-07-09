'use strict';

var Router = Reach.Router;

Router.get('/users/me', {
  policy : 'authenticate',
  uses   : 'UsersController@me'
});

Router.resource('users', 'UsersController', {
  params : ['firstName', 'lastName', 'email', 'password'],
});