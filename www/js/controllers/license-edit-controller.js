'use strict';
var angular = require('angular');

function LicenseEditController ($injector, foundLicense) {
  var $data = $injector.get('$data');
  var $auth = $injector.get('$auth');

  this.license = foundLicense;
  if (!this.license.firstName) {
    this.license.firstName = $auth.me.firstName;
    this.license.lastName = $auth.me.lastName;
  }

  // TODO
  /* eslint-disable no-unused-vars */
  function updateLicense (uploadResponse) {
    var oldFileId = this.license.fileId;
    this.license.fileId = uploadResponse.id;

    return this.license.$save()
    .then(function () {
      if (!oldFileId) {
        return false;
      }
      return $data.resources.File.destroy({
        id: oldFileId
      });
    });
  }
}

module.exports = angular.module('app.controllers').controller('LicenseEditController', [
  '$injector',
  'foundLicense',
  LicenseEditController
]);
