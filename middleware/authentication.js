/**
  Authentication
  ==============

  Authentication middleware using reach-auth for token based authentication using koa.

  @author  Christoffer Rødvik (C) 2015
  @license MIT
 */

'use strict';

// ### Dependencies

var auth   = require('reach-auth');
var bcrypt = require('co-bcrypt');
var User   = reach.model('User');

// ### Authentication Handlers

/**
 * Register reach-auth user handler, this method is used when retrieving
 * a user from the database with the user id retrieved from the auth-token
 * @param  {string} id
 * @return {object} user
 */
auth.handle('user', function *(id) {
  var user = yield User.find({ where: { id : id }, limit: 1 });
  if (!user) {
    this.throw({
      type    : 'AUTH_INVALID_USER',
      message : 'The user requested with the token does not exist'
    }, 401);
  }
  return user;
});

/**
 * Register reach-auth login handler
 * @param  {string} email
 * @param  {string} password
 * @return {object} user
 */
auth.handle('login', function *(email, password) {
  var user = yield User.find({ where: { email: email }, limit: 1 });

  // ### Validate User
  // Check if a user was returned with the provided email address

  if (!user) {
    this.throw({
      type    : 'AUTH_INVALID_CREDENTIALS',
      message : 'The email and/or password provided did not match any record in our database'
    }, 401);
  }

  // ### Validate Password
  // Validate the user password provided with the provided password

  var validPassword = yield bcrypt.compare(password, user.password);
  if (!validPassword) {
    this.throw({
      type    : 'AUTH_INVALID_CREDENTIALS',
      message : 'The email and/or password provided did not match any record in our database'
    }, 401);
  }

  // ### Prepare User
  // Return the JSON representation of the authenticated user and generate
  // a new access token that will be provided with the login result.

  user       = user.toJSON();
  user.token = yield auth.token(user.id);

  return user;
});

// ### Load Middleware

module.exports = function (app) {
  app.use(auth.middleware);
};