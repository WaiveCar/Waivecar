'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/camera-service');

function LicenseController ($scope, $stateParams, $injector) {
  var CameraService = $injector.get('CameraService');
  var $state = $injector.get('$state');
  var $message = $injector.get('$message');
  var $data = $injector.get('$data');
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
      }.bind(this));
  }

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
    this.hideSheet = $ionicActionSheet.show({
      buttons: [
        {text: 'Take Photo…'},
        {text: 'Choose from Library'}
      ],
      cancelText: 'Cancel',
      buttonClicked: function (index) {
        if (index === 0) {
          this.takePhoto();
        } else if (index === 1) {
          this.pickFromLibrary();
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
          return $state.go('licenses-new', {
            fileId: uploadResponse.id,
            step: 3,
            fromBooking: $state.params.fromBooking
          });
        }

        if (this.fromBooking){
          return $state.go('licenses-new', {
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
    CameraService.pickFile()
      .then(function (picture) {
        return CameraService.uploadPicture(picture);
      })
      .then(function (uploadResponse) {

        if($scope.license){
          return updateLicense(uploadResponse);
        }

        if ($scope.isWizard) {
          return $state.go('licenses-new', {
            fileId: uploadResponse.id,
            step: 3,
          });
        }

        if($scope.fromBooking){
          return $state.go('licenses-new', {
            fileId: uploadResponse.id,
            fromBooking: true
          });
        }
      })
      .then(function () {
        if (!$scope.isWizard && $scope.license) {
          $state.go('licenses-edit', {
            id: $scope.license.id
          });
        }
      })
      .catch($message.error.bind($message));
  };
}

module.exports = angular.module('app.controllers').controller('LicenseController', [
  '$scope',
  '$stateParams',
  '$injector',
  LicenseController
]);
