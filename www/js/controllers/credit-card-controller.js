'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('CreditCardController', [
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  '$stateParams',
  '$q',
  '$modal',
  '$timeout',
  function ($scope, $state, $auth, $data, $message, $stateParams, $q, $modal, $timeout) {

    $scope.save = function(form) {
      if (form.$pristine) {
        return $message.info('Please fill in the form fields first.');
      }

      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      return $q.resolve()
        .then(function(){
          if ($auth.me.stripeId) {
            return false;
          }

          return $data.resources.users.createCustomer({}, {
              userId: $scope.me.id,
              customer: {
                description: 'WaiveCar customer registered via app.'
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
          $modal('result', {
            icon: 'check-icon',
            title: 'Your payment method looks okay.'
          })
          .then(function (modal) {
            modal.show();
            return $timeout(2000).then(function () {
              modal.remove();
              if ($scope.fromBooking) {
                return $state.go('cars-show');
                // return $state.go('cars-show', BookingService.getReturnParams());
              }

              if ($scope.isWizard) {
                return $state.go('cars');
              }

              $state.go('credit-cards');
            });
          });
        })
        .catch(function (err) {
          var modal;
          $modal('result', {
            icon: 'x-icon',
            title: 'Error adding your credit card',
            message: err.message,
            actions: [{
              className: 'button-balanced',
              text: 'Retry',
              handler: function () {
                modal.remove();
              }
            }]
          }).then(function (_modal) {
            modal = _modal;
            modal.show();
          });
        });
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
