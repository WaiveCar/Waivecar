angular.module('app.controllers').controller('AdController', [
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
      if ($data.active.users) return $scope.fetch();
      $scope.$watch(function() { return $data.active.users; }, function(activeUser) {
        if (activeUser) $scope.fetch();
      });
    };

    $scope.init();
  }
]);
