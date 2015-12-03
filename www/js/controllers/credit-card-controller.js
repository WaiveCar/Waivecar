'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  '$stateParams',
  '$ionicHistory',
  'BookingService',
  '$q',
  function ($rootScope, $scope, $state, $auth, $data, $message, $stateParams, $ionicHistory, BookingService, $q) {

    $scope.save = function(form) {
      if (form.$pristine) {
        return $message.info('Please fill in the form fields first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      return $q.when()
        .then(function(){
          if ($auth.me.stripeId) {
            return false;
          }

          return $data.resources.users.createCustomer({}, {
              userId: $scope.me.id,
              customer : {
                description : 'WaiveCar customer registered via app.'
              }
            }).$promise;
        })
        .then(function() {
          return $auth.reload();
        })
        .then(function() {
          var card = angular.copy($scope.card);
          return card.$save();
        })
        .then(function() {
          if($scope.fromBooking){
            return $state.go('cars-show', BookingService.getReturnParams());
          }

          if($scope.isWizard){
            return $state.go('cars');
          }

          $state.go('credit-cards');

        })
        .catch($message.error);

    };

    $scope.init = function() {
      $scope.isWizard = $stateParams.step;
      $scope.fromBooking = $stateParams.fromBooking;
      $scope.me = $auth.me;

      if (!$stateParams.id) {
        $scope.card = new $data.resources.Card({
          userId: $scope.me.id,
          service: 'stripe',
          card: {}
        });

      } else {
        return $data.resources.Card.get({
            id: $stateParams.id
          }).$promise
          .then(function(card) {
            $scope.card = card;
          })
          .catch($message.error);
      }

    };

    $scope.init();

  }

]);
