angular.module('app.controllers').controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$state',
  '$ionicPopover',
  'MockLocationService',
  '$auth',
  '$data',
  '$message',
  '$session',
  '$document',
  function ($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data, $message, $session, $document) {
    'use strict';
    $rootScope.isInitialized = false;
    $rootScope.models = $data.models;
    $rootScope.active = $data.active;
    $rootScope.me = $data.me;
    // $rootScope.currentLocation;

    // $ionicPopover.fromTemplateUrl('/templates/common/menu.html', {
    //   scope: $scope
    // }).then(function (popover) {
    //   $scope.popover = popover;
    // });

    function getWindowWidth() {
      return $document.width();
    }

    $document.on('resize', function () {
      $scope.windowWidth = getWindowWidth();
    });

    $scope.windowWidth = getWindowWidth();

    $rootScope.$watch('currentLocation', function () {
      console.log($rootScope.currentLocation);
    });

    $rootScope.$on('authError', function () {
      $auth.logout();
    });

    $rootScope.$on('socket:error', function (ev, data) {
      console.log('TODO: handle socket error:');
    });

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams /*, fromState, fromParams */ ) {
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

    $scope.logout = function () {
      $auth.logout(function (err) {
        if (err) {
          return $message.error(err);
        }
        $scope.popover.hide();
        $state.go('landing');
      });

    };

    $scope.toggleNav = function () {
      if ($scope.popover.isShown()) {
        return $scope.popover.hide();
      }
      $scope.popover.show();

    };

    $scope.locateMe = function () {
      LocationService.getLocation().then(function (deviceLocation) {
        $rootScope.currentLocation = deviceLocation;
      });

    };

    $scope.fetch = function () {
      async.parallel([

          function (nextTask) {
            LocationService.initPositionWatch();
            return nextTask();
          },

          function (nextTask) {
            if (!$auth.isAuthenticated()) {
              return nextTask();
            }

            $data.resources.users.me(function (me) {
              $session.set('me', me).save();
              $data.me = $session.get('me');
              return nextTask();
            });

          },

          function (nextTask) {
            $data.initialize('cars', nextTask);
          },

          function (nextTask) {
            $data.initialize('locations', nextTask);
          }

        ],
        function (err) {
          if (err) {
            return $message.error(err);
          }
          $rootScope.isInitialized = true;

        });

    };

    $scope.init = function () {
      $scope.fetch();
    };

    $scope.init();

  }

]);
