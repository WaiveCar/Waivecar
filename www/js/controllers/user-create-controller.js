'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

function UserCreateController ($injector) {
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $ionicLoading = $injector.get('$ionicLoading');
  this.user = new $data.resources.users();

  this.save = function saveUser (form) {
    var arr = this.user.fullName.split(' ');
    this.user.firstName = arr[0];
    this.user.lastName = arr[1];

    if (!this.user.firstName || !this.user.lastName){
      return $message.error('Field "Full Name" has to include a space.');
    }

    if (form.$invalid) {
      return $message.error('Please fix form errors and try again.');
    }

    var credentials = {
      identifier: this.user.email,
      password: this.user.password
    };

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    return this.user.$save()
      .then(function login () {
        return $auth.login(credentials);
      })
      .then(function () {
        $ionicLoading.hide();
        return $state.go('auth-account-verify', { step: 2 });
      })
      .catch(function (err) {
        $ionicLoading.hide();
        $message.error(err);
      });
  };


  this.registerWithFacebook = function registerWithFacebook () {

    return $auth.facebookAuth()
      .then(function (res) {
        if (res.code === 'NEW_USER') {
          return $state.go('users-new-facebook', {
            step: 2
          });
        } else if (res.code === 'LOGGED_IN') {
          return $state.go('cars');
        }
      })
      .catch(function (err) {
        $message.error(err);
      });

  };
}

module.exports = angular.module('app.controllers')
.controller('UserCreateController', [
  '$injector',
  UserCreateController
]);
