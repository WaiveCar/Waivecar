angular.module('app.controllers').controller('MessageController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;

    $scope.init = function() {
    };

    $scope.init();
  }
]);
