'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/camera-service');

module.exports = angular.module('app.controllers').controller('LicensePhotoController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  'CameraService',
  '$location',
  '$stateParams',
  function ($rootScope, $scope, $state, $auth, $data, $message, CameraService, $location, $stateParams) {

    function updateLicense(uploadResponse) {
      console.log('updateLicense', $scope.license.fileId, uploadResponse);
      var oldFileId = $scope.license.fileId;
      $scope.license.fileId = uploadResponse.id;
      console.log('Updating license with', $scope.license);
      return $scope.license.$save()
        .then(function () {
          if(!oldFileId){
            return false;
          }
          return $data.resources.File.destroy({
            id: oldFileId
          });
        });

    }

    $scope.takePhoto = function () {

      CameraService.getPicture()
        .then(function (picture) {
          return CameraService.uploadPicture(picture);
        })
        .then(function (uploadResponse) {
          if ($scope.isWizard) {
            return $state.go('licenses-new', {
              fileId: uploadResponse.id,
              redirectTo: 'credit-cards-new'
            });

          }

          return updateLicense(uploadResponse);

        })
        .then(function () {
          if (!$scope.isWizard) {
            $state.go('licenses-edit', {
              id: $scope.license.id
            });
          }

        })
        .catch($message.error);

    };

    $scope.uploadPhoto = function () {

      CameraService.pickFile()
        .then(function (picture) {
          return CameraService.uploadPicture(picture);
        })
        .then(function (uploadResponse) {
          if ($scope.isWizard) {
            return $state.go('licenses-new', {
              fileId: uploadResponse.id,
              redirectTo: 'credit-cards-new'
            });
          }

          return updateLicense(uploadResponse);

        })
        .then(function () {
          if (!$scope.isWizard) {
            $state.go('licenses-edit', {
              id: $scope.license.id
            });
          }

        })
        .catch($message.error);

    };

    $scope.init = function () {
      $scope.isWizard = $stateParams.step;

      console.log('$stateParams', $stateParams);
      console.log('$scope.isWizard', $scope.isWizard);

      if ($stateParams.licenseId) {
        $data.resources.licenses.get({
          id: $stateParams.licenseId
        }).$promise
          .then(function (license) {
            $scope.license = license;
          });
      }

    };

    $scope.init();

  }

]);
