'use strict';
var angular = require('angular');
var moment = require('moment');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/upload-image-service');

function LicenseController($injector, $stateParams){
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var USStates = $injector.get('USStates');
  var $timeout = $injector.get('$timeout');
  var $state = $injector.get('$state');
  var $modal = $injector.get('$modal');
  var $message = $injector.get('$message');
  var $q = $injector.get('$q');

  this.isWizard = !!$stateParams.step;
  this.fromBooking = !!$stateParams.fromBooking;
  this.license = this.license || new $data.resources.licenses({
      country: 'USA',
      userId: $auth.me.id
    });
  if ($auth.me.firstName){
    this.license.firstName = $auth.me.firstName;
  }
  if ($auth.me.lastName){
    this.license.lastName = $auth.me.lastName;
  }
  this.states = USStates;

  var self = this;

  this.cancel = function() {
    $state.go('users-edit');
  };

  this.submit = function(form){
    if (form.$invalid){
      return $message.error('Please fix form errors and try again.');
    }
    if (moment().diff(moment(this.license.expirationDate, 'MM/DD/YYYY')) > 0){
      return $message.error("Whoa! Looks like your license is expired already. WaiveCar requires a current and valid driver's license.");
    }

    return this.license.$create()
    .then(function () {
      var modal;
      return $modal('result', {
        icon: 'check-icon',
        title: 'License info received'
      })
      .then(function (_modal) {
        modal = _modal;
        modal.show();
        return modal;
      })
      .then(function () {
        return $timeout(1000);
      })
      .then(function () {
        modal.remove();
        this.nextState();
      }.bind(this));
    }.bind(this))
    .catch(function onUploadFailed (err) {
      var modal, message = 'Looks like the formatting of your license is wrong, please try again.';
      if('data' in err && 'message' in err.data) {
        message = err.data.message;
      }
      $modal('result', {
        icon: 'x-icon',
        title: message,
        actions: [{
          className: 'button-balanced',
          text: 'Retry',
          handler: function () {
            modal.remove();
          }
        }, {
          className: 'button-dark',
          text: 'Skip',
          handler: function () {
            modal.remove();
            self.nextState();
          }
        }]
      })
      .then(function (_modal) {
        modal = _modal;
        modal.show();
      });
      $q.reject(err);
    });
  };

  this.nextState = function(){
    if (this.isWizard) {
      $state.go('verify-id', {step: 4});
      return;
    }
    $state.go('users-edit');
  };

}

module.exports = angular.module('app.controllers')
  .controller('LicenseController', [
    '$injector',
    '$stateParams',
    LicenseController
  ]);
