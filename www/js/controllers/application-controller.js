angular.module('app.controllers').controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$state',
  '$ionicPopover',
  'mockCityLocationService',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data) {
    $rootScope.models = $data.models;
    $rootScope.active = $data.active;

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
      $scope.popover.show($event);
    }

    $scope.hideNav = function() {
      $scope.popover.hide();
    }

    $scope.locateMe = function() {
      LocationService.mockLocation();
    };

    $scope.fetch = function() {
      $data.initialize('cars');
      $data.initialize('locations');
    };

    $scope.init = function() {
      $scope.fetch();
    };

    $scope.init();
  }
]);
