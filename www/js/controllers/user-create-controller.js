'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

function UserCreateController ($injector, $stateParams) {

  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $q = $injector.get('$q');
  var FacebookService = {}; // stub

  this.save = function saveUser (form) {
    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    var identifier = this.user.email;
    var pass = this.user.password;

    function login () {
      return $auth.login({
        identifier: identifier,
        password: pass
      });
    }

    function connectWithFacebook () {
      if(!$stateParams.fbUser){
        return $q.reject('No Facebook user');
      }

      var fbUser = angular.fromJson($stateParams.fbUser);

      return $auth.connectWithFacebook(fbUser.token);
    }

    return this.user.$save()
      .then(login)
      .then(connectWithFacebook)
      .catch(function (err) {
        if(err){
          return $message.error(err);
        }

        return $state.go('auth-account-verify', {
          step: 2
        });
      });

  };


  this.registerWithFacebook = function registerWithFacebook () {

    return FacebookService.getLoginStatus()
      .then(function (res) {
        if (res.status === 'connected') {
          return res;
        }
        return FacebookService.login(['public_profile', 'email']);
      })
      .then(function (response) {
        return FacebookService.api('/me?fields=email,first_name,last_name')
        .then(function (fbUser) {
          fbUser.token = response.authResponse.accessToken;
          return fbUser;
        });
      })
      .then(function (fbUser) {
        return $state.go('users-new-facebook', {
          fbUser: angular.toJson(fbUser),
          step: 2
        });
      })
      .catch(function (err) {
        return $message.error(err);
      });

  };

  this.init = function() {

    this.user = new $data.resources.users();

    if($stateParams.fbUser){
      var fbUser = angular.fromJson($stateParams.fbUser);
      this.user.firstName = fbUser.first_name;
      this.user.lastName = fbUser.last_name;
      this.user.email = fbUser.email;
      this.user.token = fbUser.token;
    }

  };

  this.init();

}

module.exports = angular.module('app.controllers')
.controller('UserCreateController', [
  '$injector',
  '$stateParams',
  UserCreateController
]);
