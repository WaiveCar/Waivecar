angular.module('app.controllers').controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  '$account',
  '$data',
  function($rootScope, $scope, $state, $account, $data) {

    $scope.data = $data.data;
    $scope.active = $data.active;

    $scope.fetch = function(next) {
      async.series([
        function(completeTask) {
          $data.init('users', completeTask);
        },
        function(completeTask) {
          $data.activate('users', $account.me.id, completeTask);
        }
      ], function(err) {
        if (err) {
          $state.go('app');
          //$notification.error(err);
        }
        if (next) next();
      });
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
