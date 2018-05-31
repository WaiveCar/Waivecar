'use strict';
var angular = require('angular');
var moment = require('moment');
require('../services/validate-license');

function LicenseEditController ($injector, licenses, $scope) {
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var USStates = $injector.get('USStates');
  var $message = $injector.get('$message');
  var $validateLicense = $injector.get('$validateLicense');

  this.license = licenses;

  if (!(this.license instanceof $data.resources.licenses)) {
    this.license = new $data.resources.licenses(this.license);
  }

  if (!this.license.firstName) {
    this.license.firstName = $auth.me.firstName;
    this.license.lastName = $auth.me.lastName;
  }

  if (this.license.birthDate) {
    this.birthDateString = this.license.birthDateOriginal.split(/T/)[0];
  }

  this.canEdit = (this.license.status == null || this.license.status === 'pending');
  this.states = USStates;


  this.update = function updateLicense (form) {
    if (form.$pristine) {
      return $message.info('Please fill in your credentials first.');
    }
    if (form.$invalid) {
      return $message.error('Please resolve form errors and try again.');
    }
    return this.license.$save();
  };

  var validating;
  this.validate = function validate () {
    if (validating) {
      return null;
    }
    validating = true;
    $scope.$on('$destroy', function () {
      $validateLicense.cancelPolling();
    });
    return $validateLicense.validate(this.license)
      .finally(function () {
        validating = false;
      });
  };
}

module.exports = angular.module('app.controllers').controller('LicenseEditController', [
  '$injector',
  'licenses',
  '$scope',
  LicenseEditController
]);
