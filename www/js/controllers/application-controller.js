'use strict';
var angular = require('angular');
require('angular-ui-router');
require('ionic');
require('../services/mock-city-location-service.js');
require('../services/auth-service.js');
require('../services/data-service.js');
require('../services/message-service.js');
require('../services/session-service.js');
var _ = require('lodash');

module.exports =
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
    '$q',
    function($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data, $message, $session, $document, $q) {
      $scope.isInitialized = false;
      $scope.models = $data.instances;
      $scope.active = $data.active;

      function getWindowWidth() {
        return $document.width();
      }

      $document.on('resize', function() {
        $scope.windowWidth = getWindowWidth();
      });

      $scope.windowWidth = getWindowWidth();

      $rootScope.$watch('currentLocation', function() {
        console.log($rootScope.currentLocation);
      });

      $rootScope.$on('authError', function() {
        $auth.logout();
        $state.go('auth-login');
      });

      // $rootScope.$on('socket:error', function (ev, data) {
      //   console.log('TODO: handle socket error:');
      // });

      $rootScope.$on('$stateChangeStart', function(event, toState) {
        var authRequired;
        if (toState && _.has(toState, 'data') && _.has(toState.data, 'auth')) {
          authRequired = toState.data.auth;
        }
        var isAuthenticated = $auth.isAuthenticated();

        if (isAuthenticated && !_.isUndefined(authRequired) && authRequired === false) {
          $auth.logout();
          event.preventDefault();
          $state.go('landing');
        } else if (!isAuthenticated && authRequired) {
          event.preventDefault();
          $state.go('auth-login');
        }

      });

      $scope.logout = function() {
        $auth.logout(function(err) {
          if (err) {
            return $message.error(err);
          }
          $scope.popover.hide();
          $state.go('landing');
        });

      };

      // $scope.locateMe = function() {
      //   LocationService.getLocation().then(function(deviceLocation) {
      //     $rootScope.currentLocation = deviceLocation;
      //   });

      // };

      $scope.fetch = function() {
        function positionWatch () {
          LocationService.initPositionWatch();
          return $q.when();
        }

        function saveSession () {
          return $q(function (done) {
            $data.resources.users.me(function(me) {
              $session.set('me', me).save();
              $data.me = $session.get('me');
              done();
            });
          });
        }

        function initializeLocations () {
          return $data.initialize('locations');
        }

        $q.all([positionWatch, saveSession, initializeLocations])
          .then(function () {
            $rootScope.isInitialized = true;
          })
          .catch(function (err) {
            if (err) {
              return $message.error(err);
            }
          });
      };

      $scope.init = function() {
        if ($auth.isAuthenticated()) {
          $scope.fetch();
        } else {
          // after account has been initialized
          $scope.$watch(function() {
            return $auth.isAuthenticated();
          }, function(data) {
            if (data === true) {
              $scope.fetch();
            }
          });
        }
      };

      $scope.init();

    }

  ]);
