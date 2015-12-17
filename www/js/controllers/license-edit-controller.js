'use strict';
var angular = require('angular');

function LicenseEditController ($injector, licenses) {
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');

  if (Array.isArray(licenses) && licenses.length) {
    this.license = licenses[0];
  } else if (licenses instanceof $data.resources.licenses) {
    this.license = licenses;
  } else {
    this.license = new $data.resources.licenses({
      userId: $auth.me.id,
      country: 'USA'
    });
  }

  if (!this.license.firstName) {
    this.license.firstName = $auth.me.firstName;
    this.license.lastName = $auth.me.lastName;
  }

  this.update = function updateLicense () {
    return this.license.$save();
  };
}

module.exports = angular.module('app.controllers').controller('LicenseEditController', [
  '$injector',
  'licenses',
  LicenseEditController
]);
