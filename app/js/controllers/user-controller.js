angular.module('app.controllers').controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$notification',
  '$data',
  function ($rootScope, $scope, $state, $account, $auth, $notification, $data) {

    $scope.active = $data.active;
    $scope.data = $data.data;

    var initUser = function(next) {
      $data.activate('users', $state.params.id, next, true);
    };

    $scope.fetch = function(next) {
      async.parallel([ initUser ], function(err) {
        $scope.initialized = true;
      });
    };

    $scope.init = function() {
      if ($account.initialized) {
        $scope.fetch();
      } else {
        // after account has been initialized
        $scope.$watch(function() { return $account.initialized; }, function(data) {
          if (data === true) {
            $scope.fetch();
          }
        });
      }
    };

    $scope.init();
  }
]);
