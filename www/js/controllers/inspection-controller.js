'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');

module.exports = angular.module('app.controllers').controller('InspectionController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $message) {

    $scope.init = function () {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function (err) {
        if(err){
          return $message.error(err);
        }
        $data.activate('cars', $data.active.bookings.carId, function (_err) {
          if(_err){
            return $message.error(err);
          }
          var connected = $scope.$watch(function () {
            return true;
          }, function (newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
              connected();
              // TODO: move to dash
            }
          });
        });

      });

    };

    $scope.init();

  }
]);
