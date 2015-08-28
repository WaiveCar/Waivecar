angular.module('app.controllers').controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$state',
  '$ionicPopover',
  'mockCityLocationService',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data) {
    $scope.data   = $data.models;
    $scope.active = $data.active;

    $ionicPopover.fromTemplateUrl('/templates/common/menu.html', {
      scope: $scope
    }).then(function(popover) {
      $scope.popover = popover;
    });

    $rootScope.$on('authError', function() {
      $auth.logout();
    });

    $rootScope.$on('socket:error', function (ev, data) {
      console.log('TODO: handle socket error:');
      console.log(ev);
      console.log(data);
    });

    $rootScope.$on('$stateChangeStart', function(event, toState, toParams /*, fromState, fromParams */) {
      var authRequired;
      if (toState && _.has(toState, 'data') && _.has(toState.data, 'auth')) {
        authRequired = toState.data.auth;
      }
      if ($auth.token) {
        if (authRequired === undefined) {
          // authenticated but not necessary, pass through.
        } else if (authRequired) {
          // authenticated and required, pass through.
        } else {
          // authenticated but meant to be anon, redirect to / to force logout.
          $state.go('/');
        }
      } else {
        if (authRequired === undefined) {
          // not authenticated and not necessary, pass through.
        } else if (authRequired) {
          // not authenticated and required
          $state.go('auth');
        } else {
          // not authenticated and not meant to be, pass through
        }
      }
    });

    $scope.logout = function() {
      $auth.logout($scope.active.users, function(err) {
        $scope.popover.hide();
        $state.go('/');
      });
    };

    $scope.showNav = function($event) {
      $scope.popover.show($event);
    }

    $scope.hideNav = function() {
      $scope.popover.hide();
    }

    $scope.locateMe = function() {
      LocationService.mockLocation();
    };

    $scope.fetch = function() {
      $data.initialize('licenses');
      $data.initialize('bookings');
    };

    $scope.init = function() {
      $data.initialize('cars');
      $data.initialize('locations');
      if ($data.active.users) {
        return $scope.fetch();
      } else if ($auth.token) {
        $data.resources.users.me(function(me) {
          $data.activate('users', me.id, function(err) {
            $scope.fetch();
          });
        });
      } else {
        $scope.$watch(function() { return $data.active.users; }, function(activeUser) {
          if (activeUser) $scope.fetch();
        });
      }

    };

    $scope.init();
  }
]);
