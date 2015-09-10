angular.module('app.controllers').controller('LicenseController', [
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
    'use strict';

    $scope.forms = {
      licenseForm: {
        country: 'USA',
        firstName: $auth.me.firstName,
        lastName: $auth.me.lastName,
        userId: $auth.me.id,
        fileId: $location.search().fileId
      }
    };

    $scope.datepickerObject = {
      callback: function (date) {
        if (date) {
          $scope.forms.licenseForm.birthDate = date;
        }

      }
    };

    $scope.takePhoto = function () {

      CameraService.getPicture()
        .then(function (picture) {
          return CameraService.uploadPicture(picture);
        })
        .then(function (uploadResponse) {
          $state.go('licenses-new', {
            fileId: uploadResponse.id,
            redirectTo: 'credit-cards-new'
          });

        })
        .catch($message.error);

    };

    $scope.uploadPhoto = function () {

      CameraService.pickFile()
        .then(function (picture) {
          return CameraService.uploadPicture(picture);
        })
        .then(function (uploadResponse) {
          $state.go('licenses-new', {
            fileId: uploadResponse.id,
            redirectTo: 'credit-cards-new'
          });

        })
        .catch($message.error);

    };

    $scope.createLicense = function (form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      $data.create('licenses', $scope.forms.licenseForm, function (err) {
        if (err) {
          return $message.error(err);
        }

        if ($location.search().redirectTo) {
          return $state.go($location.search().redirectTo);
        }

        $state.go('landing', {
          id: $data.me.id
        });

      });

    };

    $scope.removeLicense = function () {
      $data.removeLicense($scope.forms.licenseForm, function (err) {
        if (err) {
          return $message.error(err);
        }

        if ($scope.redirection.redirectState) {
          $state.go($scope.redirection.redirectState, $scope.redirection.redirectParams);
        }

        $state.go('users-show', {
          id: $data.me.id
        });

      });

    };

    $scope.init = function () {
      $scope.redirection = {
        redirectState: $state.params.redirectState,
        redirectParams: $state.params.redirectParams
      };

    };

    $scope.init();

  }

]);
