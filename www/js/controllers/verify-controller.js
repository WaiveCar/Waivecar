'use strict';
var angular = require('angular');

function VerifyController ($injector, $stateParams) {
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
  var $auth = $injector.get('$auth');
  var $state = $injector.get('$state');
  var BookingService = $injector.get('BookingService');

  this.form = {
    token: $stateParams.token
  };
  this.isWizard = !!$stateParams.step;
  this.fromBooking = !!$stateParams.fromBooking;

  this.submit = function verify (form) {
    if (form.$pristine) {
      return $message.info('Please fill in verification code first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }

    $data.resources.Verification.verify(this.form).$promise
      .then(function(){
        return $auth.reload();
      })
      .then(function(){
        if(this.isWizard){
          return $state.go('licenses-new', { step: 3 });
        }
        if(this.fromBooking){
          return $state.go('cars-show', BookingService.getReturnParams());
        }
        $message.success('Your account is now verified!');
        $state.go('cars');
      }.bind(this))
      .catch($message.error.bind($message));
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
  .controller('VerifyController', ['$injector', '$stateParams', VerifyController]);
