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
  function ($rootScope, $scope, $state, $auth, $data, $message) {
    $scope.forms = {
      creditCardForm: {}
    };

    $scope.createCreditCard = function (form) {
      if (form.$pristine) {
        return $message.info('Please fill in your credentials first.');
      }
      if (form.$invalid) {
        return $message.error('Please resolve form errors and try again.');
      }

      $data.createCreditCard($scope.forms.creditCardForm, function (err) {
        if (err) {
          return $message.error(err);
        }

        if ($scope.redirection.redirectState) {
          return $state.go('cars', $scope.redirection);
        }
        $state.go('users-edit', {
          id: $data.me.id
        });

      });

    };

    $scope.removeCreditCard = function () {
      $data.removeCreditCard($scope.forms.creditCardForm, function (err) {
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
