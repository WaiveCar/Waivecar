'use strict';
var angular = require('angular');
require('../services/modal-service');

function VerifyController($injector, $stateParams){
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
  var $auth = $injector.get('$auth');
  var $state = $injector.get('$state');
  var $modal = $injector.get('$modal');
  var $timeout = $injector.get('$timeout');
  var $ionicHistory = $injector.get('$ionicHistory');

  this.form = {
    token: $stateParams.token
  };
  this.isWizard = !!$stateParams.step;
  this.fromBooking = !!$stateParams.fromBooking;

  if($auth.me && $auth.me.phone && $auth.me.phone.replace) {
    this.phone = $auth.me.phone.replace(/[+1]*(\d{3})(\d{3})(.*)/, '($1) $2-$3');
  } else {
    // if we don't have a phone number then that means we got here before
    // we should have.
    return $state.go('users-edit-general');
  }

  this.submit = function(form){
    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    }
    var self = this;

    $data.resources.Verification.verify(this.form).$promise
      .then(function(){
        return $auth.reload();
      })
      .then(function(){
        return $modal('result', {
          title: 'Mobile validation succeeded',
          icon: 'check-icon',
        });
      })
      .then(function (modal) {
        modal.show();
        return $timeout(2000)
        .then(function () {
          modal.remove();
          if (self.isBooking) {
            return $ionicHistory.goBack();
          }
          if (self.isWizard) {
            return $state.go('licenses-new', {step: 3});
          }
          return $state.go('users-edit');
        });
      })
      .catch(function (err) {
        var modal;
        return $modal('result', {
          title: 'Wrong code',
          icon: 'x-icon',
          message: err.message,
          actions: [{
            className: 'button-balanced',
            text: 'Retry',
            handler: function () {
              modal.remove();
            }
          }]
        })
        .then(function (_modal) {
          modal = _modal;
          modal.show();
        });
      });
  };

  this.change = function change() {
    $auth.bypass = true;
    $state.go('users-edit-general');
  };

  this.abort = function abort () {
    $auth.bypass = true;
    $state.go('users-edit');
  };

  this.resend = function resend () {
    $data.resources.Verification.sendSMS({}).$promise
      .then(function(){
        $message.success('Verification code sent to ' + $auth.me.phone);
      })
      .catch($message.error.bind($message));
  };
}

module.exports = angular.module('app.controllers')
  .controller('VerifyController', [
    '$injector',
    '$stateParams',
    VerifyController
  ]);