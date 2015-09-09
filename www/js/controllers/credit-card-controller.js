angular.module('app.controllers').controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, $message) {
    'use strict';
    $scope.forms = {
      creditCardForm: {}
    };

    $scope.createCreditCard = function () {
      $data.createCreditCard($scope.forms.creditCardForm, function (err) {
        if (err) {
          return $message.error(err);
        }

        if ($scope.redirection.redirectState) {
          return $state.go('cars', $scope.redirection);
        }
        $state.go('users-show', {
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
