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

  this.save = function saveUser (form) {
    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    var credentials = {
      identifier: this.user.email,
      password: this.user.password
    };

    return this.user.$save()
      .then(function login () {
        return $auth.login(credentials);
      })
      .then(function () {
        return $state.go('cars');
      })
      .catch(function (err) {
        return $message.error(err);
      });
  };

  this.completeFacebookRegistration = function completeFacebookRegistration (form) {
    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    return this.user.$save()
      .then(function () {
        return $state.go('cars');
      })
      .catch($message.error.bind($message));
  };


  this.registerWithFacebook = function registerWithFacebook () {

    return $auth.facebookAuth()
      .then(function (res) {
        if (res.code === 'NEW_USER') {
          return $state.go('users-new-facebook', {
            fbUser: angular.toJson(res.fbUser),
            step: 2
          });
        } else if (res.code === 'LOGGED_IN') {
          return $state.go('cars');
        }
      })
      .catch($message.error.bind($message));

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
