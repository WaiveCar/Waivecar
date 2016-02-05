'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/message-service');

function LicenseRequestValidationController ($scope, $stateParams, $injector) {
  var $state = $injector.get('$state');
  var $message = $injector.get('$message');

  if ($stateParams.licenseId) {
    this.licenseId = $stateParams.licenseId;
  } else {
    $message('License not found');
    $state.go('users-edit');
  }
}

module.exports = angular.module('app.controllers').controller('LicenseRequestValidationController', [
  '$scope',
  '$stateParams',
  '$injector',
  LicenseRequestValidationController
]);
