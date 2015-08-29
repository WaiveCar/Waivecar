angular.module('app.controllers').controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$state',
  '$ionicPopover',
  'mockCityLocationService',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data) {
    $scope.models = $data.models;
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
      var isAuthenticated = $auth.isAuthenticated();

      if (isAuthenticated && !_.isUndefined(authRequired) && authRequired === false) {
        $auth.logout();
        $state.go('landing');
      } else if (!isAuthenticated && authRequired) {
        $state.go('auth');
      }
    });

    $scope.logout = function() {
      $auth.logout($scope.active.users, function(err) {
        $scope.popover.hide();
        $state.go('landing');
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
      // $data.initialize('licenses');
      // $data.initialize('bookings');
      $data.initialize('cars');
      $data.initialize('locations');
    };

    $scope.init = function() {
      $scope.fetch();
      // if ($data.active.users) {
      //   return $scope.fetch();
      // } else if ($auth.isAuthenticated()) {
      //   $data.resources.users.me(function(me) {
      //     $data.activate('users', me.id, function(err) {
      //       $scope.fetch();
      //     });
      //   });
      // } else {
      //   $scope.$watch(function() { return $data.active.users; }, function(activeUser) {
      //     if (activeUser) $scope.fetch();
      //   });
      // }

    };

    $scope.init();
  }
]);
