'use strict';
var angular = require('angular');

function VerifyController ($injector, $stateParams) {
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
  var $auth = $injector.get('$auth');
  var $state = $injector.get('$state');
  var $modal = $injector.get('$modal');
  var $timeout = $injector.get('$timeout');

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
        return $modal('result', {
          title: 'Mobile validation succeeded',
          icon: 'check-icon',
        });
      })
      .then(function (modal) {
        modal.show();
        $timeout(function () {
          if (this.isWizard) {
            return $state.go('licenses-new', { step: 3 });
          }
          if (this.fromBooking) {
            return $state.go('cars-show');
            // return $state.go('cars-show', BookingService.getReturnParams());
          }
        }.bind(this), 2000);
      }.bind(this))
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
