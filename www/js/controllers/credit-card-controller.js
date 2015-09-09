angular.module('app.controllers').controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.forms = {
      creditCardForm: {}
    };

    $scope.createCreditCard = function() {
      $data.createCreditCard($scope.forms.creditCardForm, function(err, data) {
        if (err) console.log(err);
        if ($scope.redirection.redirectState) {
          $state.go('cars', $scope.redirection);
        } else {
          $state.go('users-show', { id: $data.me.id });
        }
      });
    };

    $scope.removeCreditCard = function() {
      $data.removeCreditCard($scope.forms.creditCardForm, function(err, data) {
        if (err) console.log(err);
        if ($scope.redirection.redirectState) {
          $state.go($scope.redirection.redirectState, $scope.redirection.redirectParams);
        } else {
          $state.go('users-show', { id: $data.me.id });
        }
      });
    };

    $scope.init = function() {
      $scope.redirection = {
        redirectState  : $state.params.redirectState,
        redirectParams : $state.params.redirectParams
      };
    };

    $scope.init();
  }
]);
