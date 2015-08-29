angular.module('app.controllers').controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;
    $scope.forms = {
      creditCardForm: {}
    };

    $scope.createCreditCard = function() {
      $data.createCreditCard($scope.forms.creditCardForm, function(err, data) {
        if (err) console.log(err);
        if (redirectUrl) {
          $state.go('cars', $scope.redirection);
        } else {
          $state.go('users-show', { id: $data.active.users.id });
        }
      });
    };

    $scope.removeCreditCard = function() {
      $data.removeCreditCard($scope.forms.creditCardForm, function(err, data) {
        if (err) console.log(err);
        if (redirectUrl) {
          $state.go($scope.redirection.redirectUrl, $scope.redirection.redirectParams);
        } else {
          $state.go('users-show', { id: $data.active.users.id });
        }
      });
    };

    $scope.init = function() {
      $scope.redirection = {
        redirectUrl    : $state.params.redirectUrl,
        redirectParams : $state.params.redirectParams
      };
    };

    $scope.init();
  }
]);
