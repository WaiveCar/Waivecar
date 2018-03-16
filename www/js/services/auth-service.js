'use strict';
var angular = require('angular');
require('./session-service.js');
require('./data-service.js');

function AuthService ($rootScope, $session, $data, $injector) {
  this.token = $session.get('auth');
  this.me = $session.get('me');
  var $cordovaFacebook = $injector.get('$cordovaFacebook');
  var $q = $injector.get('$q');

  this.isAuthenticated = function isAuthenticated () {
    return !!(this.token && this.me);
  };

  function prepareMe() {
    var raw = $session.get('me');
    raw.hasTag = function(tag) {
      return raw.tagList.filter(function(row) {
        return row.groupRole.name === tag;
      }).length
    }
    return raw;
  }

  this.reload = function reload () {
    return $data.resources.users.me().$promise
      .then(function(me) {
        $session.set('me', me).save();
        this.me = $data.me = prepareMe();
      }.bind(this));

  };

  this.facebookAuth = function facebookAuth () {
    return $cordovaFacebook.getLoginStatus()
      .then(function(response) {
        if (response.status === 'connected') {
          return response;
        }
        return $cordovaFacebook.login(['public_profile', 'email'])
          .then(function (res) {
            if (res.status !== 'connected') {
              return $q.reject('There was a problem logging you in');
            }
            return res;
          });
      })
      .then(angular.bind(this, function(res) {
        var token = res.authResponse.accessToken;
        return loginWithFacebook(token)
          .catch(function (err) {
            if (err.status === 400 && err.data && err.data.code === 'FB_LOGIN_FAILED') {
              return registerUserWithFacebook(token);
            }
            return $q.reject(err);
          });
      }))
      .then(function (code) {
        return createSession(code)
          .then(function () {
            this.token = $session.get('auth');
            this.me = $data.me = prepareMe();
            $rootScope.$emit('authLogin', code);
            return code;
          }.bind(this));
      }.bind(this));
  };

  this.login = function login (data) {
    return $data.resources.Auth.login(data).$promise
      .then(function(user) {
        var code = {code: 'LOGGED_IN', method: 'EMAIL', user: user};
        return createSession(code)
        .then(function() {
          this.token = $session.get('auth');
          this.me = $data.me = prepareMe();
          $rootScope.$emit('authLogin', code);
          return $data.resources.Auth.remember().$promise;
        }.bind(this));
      }.bind(this))
      .catch(function(response) {
        if (response.status === 0) {
          return $q.reject('Unable to reach the server. CORS issue!');
        }
        return $q.reject(response.data.message);
      });
  };

  this.logout = function logout () {
    $session.purge();
    this.token = false;
    this.me = $data.me = false;
    $rootScope.$emit('authLogout');
  };

  this.loadSession = function loadSession () {
    if (!this.isAuthenticated()) {
      return $q.reject('User not authenticated');
    }

    return $data.resources.users.me().$promise
      .then(function(user) {
        $session.set('me', user).save();
        this.me = $data.me = prepareMe();
        return user;
      }.bind(this));
  };

  function loginWithFacebook (token) {
    return $data.resources.Auth.facebook({
      token: token,
      type: 'login',
      fields: 'first_name,last_name,email'
    }).$promise
    .then(function (user) {
      return {code: 'LOGGED_IN', method: 'FACEBOOK', user: user};
    });
  };

  function registerUserWithFacebook (token) {
    return $data.resources.Auth.facebook({
      token: token,
      type: 'register',
      fields: 'first_name,last_name,email'
    }).$promise
    .then(function (user) {
      return {code: 'NEW_USER', method: 'FACEBOOK', user: user};
    });
  };

  function createSession (code) {
    $session.set('auth', {
      token: code.user.token
    }).save();

    return $data.resources.users.me().$promise
      .then(function(user) {
        $session.set('me', user).save();
        return user;
      });
  };
}

module.exports = angular.module('app.services').service('$auth', [
  '$rootScope',
  '$session',
  '$data',
  '$injector',
  AuthService
]);
