'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/message-service');
var _ = require('lodash');

function AuthController ($rootScope, $scope, $state, $auth, $message, $data, $ionicHistory, $settings, $stateParams, BookingService) {
  this.$ionicHistory = $ionicHistory;

  this.forms = {
    loginForm: {
      from: 'app',
      // identifier: 'adibih@gmail.com',
    },
    forgotForm: {},
    resetForm: {
      token: $stateParams.token
    },
    verifyForm: {
      token: $stateParams.token
    }
  };


  this.login = function login (form) {
    if (form.$pristine) {
      return $message.info('Please fill in your credentials first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    $auth.login(this.forms.loginForm)
      .then(function(){
        $state.go('landing');
      })
      .catch($message.error);

  };

  this.initPasswordReset = function initPasswordReset (form) {
    if (form.$pristine) {
      return $message.info('Please fill in your email first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    $data.resources.User.initPasswordReset(this.forms.forgotForm).$promise
      .then(function(){
        $state.go('auth-reset-password');
      })
      .catch($message.error);

  };

  this.submitNewPassword = function submitNewPassword (form){
    if (form.$pristine) {
      return $message.info('Please fill in required fields first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    var data = _.omit(this.forms.resetForm, 'passwordConfirm');
    $data.resources.User.submitNewPassword(data).$promise
      .then(function(){
        $state.go('auth-reset-password-success');
      })
      .catch($message.error);

    };


  this.loginWithFacebook = function loginWithFacebook () {

    return FaceBookService.getLoginStatus()
      .then(function(response) {
        if (response.status !== 'connected') {
          return FaceBookService.login(['public_profile', 'email']);
        }
        return response;

      })
      .then(function(res) {
        if (res.status === 'connected') {
          return $auth.loginWithFacebook(res.authResponse.accessToken);
        }
      })
      .then(function() {
        $state.go('landing');
      })
      .catch($message.error);

  };


  this.resend = function resend () {
    $data.resources.Verification.sendSMS({}).$promise
      .then(function(){
        $message.success('Verification code sent to ' + $auth.me.phone);
      })
      .catch($message.error);

  };

  this.verify = function verify (form) {
    if (form.$pristine) {
      return $message.info('Please fill in verification code first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    $data.resources.Verification.verify(this.forms.verifyForm).$promise
      .then(function(){
        return $auth.reload();
      })
      .then(function(){
        if(this.isWizard){
          return $state.go('licenses-photo-new', {step: 3});
        }
        if(this.fromBooking){
          return $state.go('cars-show', BookingService.getReturnParams());
        }
        $message.success('Your account is now verified!');
        $state.go('cars');

      })
      .catch($message.error);

  };


  this.init = function init () {
    this.isWizard = $stateParams.step;
    this.fromBooking = $stateParams.fromBooking;

    if($state.includes('auth-reset-password')){
      this.forms.resetForm.tokenProvided = !!$stateParams.token;
    }

  };

  this.init();

}

module.exports = angular.module('app.controllers').controller('AuthController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$message',
  '$data',
  '$ionicHistory',
  '$settings',
  '$stateParams',
  'BookingService',
  AuthController

]);
