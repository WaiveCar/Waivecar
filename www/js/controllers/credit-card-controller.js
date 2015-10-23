'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
var when = require('when');

module.exports = angular.module('app.controllers').controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  '$stateParams',
  function ($rootScope, $scope, $state, $auth, $data, $message, $stateParams) {

    $scope.save = function(form) {
      if (form.$pristine) {
        return $message.info('Please fill in the form fields first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      return when.promise(function(resolve, reject) {
          if ($data.me.stripeId) {
            return resolve();
          }

          return $data.resources.users.createCustomer({
              id: $auth.me.id,
              service: 'stripe'
            }, {
              data: {
                metadata: {}
              }
            }).$promise
            .then(resolve)
            .catch(reject);

        })
        .then(function() {
          return $auth.reload();
        })
        .then(function() {
          var card = angular.copy($scope.card);
          return card.$save();
        })
        .then(function() {
          if ($scope.redirection.redirectState) {
            return $state.go('cars', $scope.redirection);
          }
          if($scope.isWizard){
            return $state.go('cars');
          }
          $state.go('credit-cards');

        })
        .catch($message.error);

    };

    $scope.init = function() {
      $scope.redirection = {
        redirectState: $state.params.redirectState,
        redirectParams: $state.params.redirectParams
      };

      $scope.isWizard = $stateParams.step;

      if (!$stateParams.id) {
        $scope.card = new $data.resources.Card({userId: $auth.me.id, service: 'stripe'});

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
