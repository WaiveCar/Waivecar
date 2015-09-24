'use strict';
var angular = require('angular');
require('./session-service.js');
require('./data-service.js');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('$auth', [
  '$session',
  '$data',
  function ($session, $data) {

    return {

      isAuthenticated: function () {
        this.token = $session.has('auth') ? $session.get('auth') : false;
        this.me = $session.has('me') ? $session.get('me') : false;
        return !!(this.token && this.me);
      },

      token: $session.has('auth') ? $session.get('auth') : false,
      me: $session.has('me') ? $session.get('me') : false,

      purge: function () {
        $session.purge();
        this.token = false;
        this.me = false;
        return this;

      },

      reload: function () {
        var _this = this;
        return $data.resources.users.me().$promise
          .then(function (me) {
            $session.set('me', me).save();
            _this.me = $data.me = $session.get('me');
          });

      },

      facebookLogin: function (code, next) {
        var _this = this;
        var data = {
          type: 'login',
          code: code,
          redirectUri: 'http://localhost/'
        };

        $data.resources.users.facebook(data, function (user) {
            $data.resources.users.me(function (me) {
              $session.set('auth', {
                token: user.token
              }).save();

              $session.set('me', me).save();

              _this.token = $session.get('auth');
              _this.me = $data.me = $session.get('me');

            });
          },
          next);

      },

      login: function (data, next) {
        var _this = this;
        var _user;
        next = _(next).isFunction() ? next : angular.identity;

        return $data.resources.users.login(data).$promise
          .then(function (user) {
            _user = user;

            $session.set('auth', {
              token: user.token
            }).save();

            _this.token = $session.get('auth');

            return $data.resources.users.me().$promise;

          })
          .then(function (me) {
            $session.set('me', me).save();
            _this.me = $data.me = $session.get('me');
            return next(null, _user);

          })
          .catch(function (response) {
            if (response.status === 0) {
              return next('Unable to reach the server. CORS issue!');
            }
            if (response.data.code === 'AUTH_INVALID_CREDENTIALS') {
              return next('Your e-mail or password is incorrect. Please try again.');
            }
            return next('An error occured! ' + response.data.message);

          });

      },

      logout: function () {
        $session.purge();
      }

      // forgot: function(data, next) {
      //   Users.forgot(data, function (data) {
      //     next(false, data);
      //   }, function(error) {
      //     if (error.data.status === 404) {
      //       next('The email you provided was not found in our database');
      //     } else {
      //       next('An error occured!');
      //     }
      //   });

      //   return this;
      // },

      // resetPassword: function(data, next) {
      //   Users.resetPassword(data, function () {
      //     next(false);
      //   }, function(error) {
      //     if (error.data.status === 400) {
      //       next(error.data.error);
      //     } else {
      //       next('An error occured!');
      //     }
      //   });

      //   return this;
      // }
    };
  }
]);
