angular.module('app.admin.controllers').controller('MainController', [
  '$rootScope',
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$notification',
  '$data',
  function ($rootScope, $scope, $state, $account, $auth, $notification, $data) {
    $rootScope.isAdminApp = true;

    $scope.hasPermission = $account.hasPermission;

    $rootScope.$watch(function() { return $account.me; }, function() {
      if (!(angular.equals($account.me, $rootScope.me))) {
        $rootScope.me = $account.me;
      }
    }, true);

    $scope.data = $data.data;

    var initSettings = function(next) {
      return $data.init('settings', next);
    };

    var initRoles = function(next) {
      return $data.init('roles', next);
    };

    $scope.fetch = function(next) {
      async.parallel([ initRoles, initSettings ], function(err) {
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
