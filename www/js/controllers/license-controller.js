'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
require('../services/camera-service');

module.exports = angular.module('app.controllers').controller('LicenseController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  'CameraService',
  '$location',
  '$stateParams',
  '$ionicHistory',
  'BookingService',
  function ($rootScope, $scope, $state, $auth, $data, $message, CameraService, $location, $stateParams, $ionicHistory, BookingService) {
    $scope.$ionicHistory = $ionicHistory;

    // $scope.forms = {
    //   licenseForm: {
    //     country: 'USA',
    //     firstName: $auth.me.firstName,
    //     lastName: $auth.me.lastName,
    //     userId: $auth.me.id,
    //     fileId: $location.search().fileId
    //   }
    // };

    $scope.datepickerObject = {
      callback: function (date) {
        if (date) {
          $scope.forms.licenseForm.birthDate = date;
        }

      }
    };

    $scope.save = function (form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      $scope.license.$save()
        .then(function () {

          if ($scope.isWizard) {
            return $state.go('credit-cards-new', {
              step: 4
            });
          }

          if($scope.fromBooking){
            return $state.go('cars-show', BookingService.getReturnParams());
          }

          if (!$stateParams.id) {
            $state.go('landing', {
              id: $data.me.id
            });
          }

        })
        .catch($message.error);

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

      $scope.isWizard = $stateParams.step;
      $scope.fromBooking = $stateParams.fromBooking;


      if ($stateParams.id) {
        $data.resources.licenses.get({
          id: $stateParams.id
        }).$promise
          .then(function (license) {
            $scope.license = license;
          })
          .catch($message.error);

      } else {

        $scope.license = new $data.resources.licenses({
          firstName: $auth.me.firstName,
          lastName: $auth.me.lastName,
          userId: $auth.me.id,
          country: 'USA'
        });

        if($stateParams.fileId){
          $scope.license.fileId = $stateParams.fileId;
        }

      }

    };

    $scope.init();

  }

]);
