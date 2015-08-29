angular.module('app.controllers').controller('CreditCardsController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;
  }
]);
