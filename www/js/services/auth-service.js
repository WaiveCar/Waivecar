'use strict';
var angular = require('angular');
require('./session-service.js');
require('./data-service.js');
var _ = require('lodash');

function AuthService ($session, $data, $injector) {
  this.token = $session.get('auth') || false;
  this.me = $session.get('me') || false;
  var $cordovaFacebook = $injector.get('$cordovaFacebook');
  var $q = $injector.get('$q');

  this.createSession = function createSession (user) {
    var _this = this;

    $session.set('auth', {
      token: user.token
    }).save();

    this.token = $session.get('auth');

    return $data.resources.users.me().$promise
      .then(function(me) {
        $session.set('me', me).save();
        _this.me = $data.me = $session.get('me');
      });

  };

  this.isAuthenticated = function isAuthenticated () {
    this.token = $session.has('auth') ? $session.get('auth') : false;
    this.me = $session.has('me') ? $session.get('me') : false;
    return !!(this.token && this.me);
  };

  this.purge = function purge () {
    $session.purge();
    this.token = false;
    this.me = false;
    return this;

  };

  this.reload = function reload () {
    var _this = this;
    return $data.resources.users.me().$promise
      .then(function(me) {
        $session.set('me', me).save();
        _this.me = $data.me = $session.get('me');
      });

  };

  this.facebookLogin = function facebookLogin (code, next) {
    var _this = this;
    var data = {
      type: 'login',
      code: code,
      redirectUri: 'http://localhost/'
    };

    $data.resources.users.facebook(data, function(user) {
        $data.resources.users.me(function(me) {
          $session.set('auth', {
            token: user.token
          }).save();

          $session.set('me', me).save();

          _this.token = $session.get('auth');
          _this.me = $data.me = $session.get('me');

        });
      },
      next);

  };

  this.loginWithFacebook = function loginWithFacebook (token) {
    var data = {
      token: token,
      type: 'login'
    };

    return $data.resources.Auth.facebook(data).$promise
      .then(angular.bind(this, this.createSession));

  };

  this.registerWithFacebook = function registerWithFacebook (token) {
    var data = {
      token: token,
      type: 'register'
    };

    return $data.resources.Auth.facebook(data).$promise
      .then(angular.bind(this, this.createSession));

  };

  this.connectWithFacebook = function connectWithFacebook (token) {
    var data = {
      token: token,
      type: 'connect'
    };

    return $data.resources.Auth.facebook(data).$promise;
  };

  function registerUserWithFacebook (token) {
    return $cordovaFacebook.api('/me?fields=email,first_name,last_name')
    .then(function (fbUser) {
      fbUser.token = token;
      return fbUser;
    })
    .then(function (fbUser) {
      return {code: 'NEW_USER', fbUser: fbUser};
    });
  }

  this.facebookAuth = function facebookAuth () {
    return $cordovaFacebook.getLoginStatus()
      .then(function(response) {
        if (response.status === 'connected') {
          return response;
        }
        return $cordovaFacebook.login(['public_profile', 'email']);
      })
      .then(angular.bind(this, function(res) {
        if (res.status !== 'connected') {
          return $q.reject('There was a problem logging you in');
        }

        var token = res.authResponse.accessToken;
        return this.loginWithFacebook(token)
          .then(function () {
            return {code: 'LOGGED_IN'};
          })
          .catch(function (err) {
            if (err.status === 400 && err.data && err.data.code === 'FACEBOOK_LOGIN_FAILED') {
              return registerUserWithFacebook(token);
            }
            return $q.reject(err);
          });
      }));
  };

  this.login = function login (data, next) {
    var _this = this;
    var _user;
    next = _(next).isFunction() ? next : angular.identity;

    return $data.resources.Auth.login(data).$promise
      .then(function(user) {
        _user = user;

        $session.set('auth', {
          token: user.token
        }).save();

        _this.token = $session.get('auth');

        return $data.resources.users.me().$promise;

      })
      .then(function(me) {
        $session.set('me', me).save();
        _this.me = $data.me = $session.get('me');
        return next(null, _user);

      })
      .catch(function(response) {
        if (response.status === 0) {
          return next('Unable to reach the server. CORS issue!');
        }
        if (response.data.code === 'AUTH_INVALID_CREDENTIALS') {
          return next('Your e-mail or password is incorrect. Please try again.');
        }
        return next('An error occured! ' + response.data.message);

      });

  };

  this.logout = function logout () {
    $session.purge();
  };
}

module.exports = angular.module('app.services').service('$auth', [
  '$session',
  '$data',
  '$injector',
  AuthService
]);
