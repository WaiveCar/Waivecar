angular.module('app.controllers').controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$state',
  '$ionicPopover',
  'MockLocationService',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data) {
    $rootScope.isInitialized = false;
    $rootScope.models = $data.models;
    $rootScope.active = $data.active;
    $rootScope.me = $data.me;
    $rootScope.currentLocation;

    $ionicPopover.fromTemplateUrl('/templates/common/menu.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $rootScope.$watch('currentLocation', function() {
      console.log($rootScope.currentLocation);
    });

    $rootScope.$on('authError', function() {
      $auth.logout();
    });

    $rootScope.$on('socket:error', function (ev, data) {
      console.log('TODO: handle socket error:');
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams /*, fromState, fromParams */) {
      var authRequired;
      if (toState && _.has(toState, 'data') && _.has(toState.data, 'auth')) {
        authRequired = toState.data.auth;
      }
      var isAuthenticated = $auth.isAuthenticated();

      if (isAuthenticated && !_.isUndefined(authRequired) && authRequired === false) {
        $auth.logout();
        $state.go('landing');
      } else if (!isAuthenticated && authRequired) {
        $state.go('auth');
      }
    });

    $scope.logout = function() {
      $auth.logout(function(err) {
        $scope.popover.hide();
        $state.go('landing');
      });
    };

    $scope.showNav = function($event) {
      console.log('asd')
      $scope.popover.show($event);
    }

    $scope.hideNav = function() {
      $scope.popover.hide();
    }

    $scope.locateMe = function() {
      LocationService.getLocation().then(function(deviceLocation) {
        $rootScope.currentLocation = deviceLocation;
      })
    };

    $scope.fetch = function() {
      async.parallel([
        function(nextTask) {
          LocationService.initPositionWatch();
          return nextTask();
          // getLocation().then(function(deviceLocation) {
          //   $rootScope.currentLocation = deviceLocation;
          //   return nextTask();
          // });
        },
        function(nextTask) {
          if ($auth.isAuthenticated()) {
            $data.resources.users.me(function(me) {
              $data.me = me;
              return nextTask();
            });
          } else {
            return nextTask();
          }
        },
        function(nextTask) {
          $data.initialize('cars', nextTask);
        },
        function(nextTask) {
          $data.initialize('locations', nextTask);
        }
      ], function(err) {
        $rootScope.isInitialized = true;
      });
    };

    $scope.init = function() {
      $scope.fetch();
    };

    $scope.init();
  }
]);
