/* global window: false */
'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/camera-service');
require('../services/loader-service');

function LicenseController ($scope, $stateParams, $injector) {
  var CameraService = $injector.get('CameraService');
  var $auth = $injector.get('$auth');
  var $state = $injector.get('$state');
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
  var $loader = $injector.get('$loader');
  var USStates = $injector.get('USStates');
  var $ionicActionSheet = $injector.get('$ionicActionSheet');

  this.isWizard = !!$stateParams.step;
  this.fromBooking = !!$stateParams.fromBooking;
  this.license = this.license || {};
  this.states = USStates;

  if ($stateParams.licenseId) {
    $data.resources.licenses.get({ id: $stateParams.licenseId }).$promise
      .then(function (license) {
        this.license = license;
        if (!this.license.firstName) {
          this.license.firstName = $auth.me.firstName;
          this.license.lastName = $auth.me.lastName;
        }
      }.bind(this));
  }

  this.createLicense = function createLicense(next) {
    this.license = new $data.resources.licenses({
      number: this.license.number,
      state: this.license.state,
      userId: $auth.me.id,
      country: 'USA'
    });

    return this.license.$save().then(next);
  };

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

  this.showPicker = function showPicker () {
    var buttons = [
      { text: 'Take Photo…' },
      { text: 'Choose from Library' }
    ];
    if (window.ionic.Platform.ua.indexOf('Chrome') > -1) {
      buttons.push({ text: 'Skip Photo (web)' });
    }

    this.hideSheet = $ionicActionSheet.show({
      buttons: buttons,
      cancelText: 'Cancel',
      buttonClicked: function (index) {
        if (index === 0) {
          this.takePhoto();
        } else if (index === 1) {
          this.pickFromLibrary();
        } else if (index === 2) {
          this.createLicense(function(license) {
            return $state.go('licenses-edit', { licenseId: license.id });
          });
        }
      }.bind(this)
    });
  };

  this.takePhoto = function takePhoto () {
    if (this.hideSheet) {
      this.hideSheet();
      this.hideSheet = null;
    }
    CameraService.getPicture()
      .then(function (picture) {
        return CameraService.uploadPicture(picture);
      })
      .then(function (uploadResponse) {
        if (this.isWizard) {
          return $state.go('credit-cards-new', {
            step: 3,
            fromBooking: $state.params.fromBooking
          });
        }

        if (this.fromBooking){
          return $state.go('licenses-edit', {
            fileId: uploadResponse.id,
            fromBooking: true
          });
        }

        return updateLicense(uploadResponse);
      }.bind(this))
      .then(function () {
        if (!this.isWizard) {
          $state.go('licenses-edit', {
            id: $scope.license.id
          });
        }
      })
      .catch($message.error);
  };

  this.pickFromLibrary = function pickFromLibrary () {
    if (this.hideSheet) {
      this.hideSheet();
      this.hideSheet = null;
    }
    CameraService.pickFile().then(function (picture) {
      return CameraService.uploadPicture(picture);
    }).then(function (uploadResponse) {
      if ($scope.license) {
        return updateLicense(uploadResponse);
      }

      this.createLicense(uploadResponse).then(function() {
        if ($scope.isWizard) {
          return $state.go('credit-cards-new', {
            step: 3
          });
        }

        if ($scope.fromBooking) {
          return $state.go('licenses-edit', {
            fileId: uploadResponse.id,
            fromBooking: true
          });
        }
      });
    }).catch($message.error.bind($message));
  };

  this.saveAndValidateLicense = function () {
    $loader.show();
    this.license.$save().then(function() {
      this.license.$verify().then(function() {
        $loader.hide();
        $state.go('users-edit');
      }).catch($message.error.bind($message));
    }.bind(this)).catch($message.error.bind($message));
  };
}

module.exports = angular.module('app.controllers').controller('LicenseController', [
  '$scope',
  '$stateParams',
  '$injector',
  LicenseController
]);
