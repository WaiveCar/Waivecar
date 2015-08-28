angular.module('app.controllers').controller('CreditCardController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.data   = $data.models;
    $scope.active = $data.active;

    $scope.fetch = function() {
    };

    $scope.init = function() {
      if ($account.initialized) return $scope.fetch();
      $scope.$watch(function() { return $account.initialized; }, function(isInitialized) {
        if (isInitialized === true) $scope.fetch();
      });
    };

    $scope.init();
  }
]);
