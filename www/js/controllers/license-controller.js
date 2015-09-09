angular.module('app.controllers').controller('LicenseController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  'CameraService',
  function ($rootScope, $scope, $state, $auth, $data, $message, CameraService) {
    'use strict';
    $scope.forms = {
      licenseForm: {}
    };

    $scope.takePhoto = function () {

      CameraService.getPicture()
        .then(function (picture) {
          return CameraService.savePicture(picture);
        })
        .then(function () {
          $message.success('Picture stored!');
        })
        .catch($message.error);

    };

    $scope.uploadPhoto = function () {

      CameraService.uploadFile()
        .then(function (file) {
          return CameraService.savePicture(file);
        })
        .then(function () {
          $message.success('Picture stored!');
        })
        .catch($message.error);

    };


    $scope.createLicense = function () {
      $data.create('licenses', $scope.forms.licenseForm, function (err) {
        if (err) {
          return $message.error(err);
        }

        if ($scope.redirection.redirectState) {
          $state.go('credit-cards-new', $scope.redirection);
        } else {
          $state.go('users-show', {
            id: $data.me.id
          });
        }

      });

    };

    $scope.removeLicense = function () {
      $data.removeLicense($scope.forms.licenseForm, function (err) {
        if (err) {
          return $message.error(err);
        }

        if ($scope.redirection.redirectState) {
          $state.go($scope.redirection.redirectState, $scope.redirection.redirectParams);
        } else {
          $state.go('users-show', {
            id: $data.me.id
          });
        }

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
