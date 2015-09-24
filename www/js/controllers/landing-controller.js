'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('LandingController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $message) {

    $scope.init = function () {

      if (!$auth.isAuthenticated()) {
        return $state.go('auth');
      }

      return $data.initialize('bookings')
        .then(function () {
          if (!$data.instances.bookings) {
            return false;
          }

          var active = _.find($data.instances.bookings, function (booking) {
            return _.contains([
              'new-booking',
              'payment-authorized',
              'pending-arrival',
              'in-progress',
              'pending-payment'
            ], booking.state);
          });

          if (!active) {
            return $state.go('cars');
          }

          console.log('active booking found (' + active.id + ' : ' + active.state + ').');

          switch (active.state) {
          case 'in-progress':
            return $state.go('bookings-in-progress', {
              id: active.id
            });
          case 'pending-payment':
            return $state.go('bookings-show', {
              id: active.id
            });
          case 'new-booking':
          case 'payment-authorized':
          case 'pending-arrival':
          default:
            return $state.go('bookings-edit', {
              id: active.id
            });
          }

        })
        .catch(function(err){
          $message.error(err);
          throw err;
        });

    };

    $scope.init();

  }

]);
