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
var async = require('async');

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
    function ($rootScope, $scope, $state, $ionicPopover, LocationService, $auth, $data, $message, $session, $document) {
      $scope.isInitialized = false;
      $scope.models = $data.models;
      $scope.active = $data.active;

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
        console.log('authError');
        $auth.logout();
        $state.go('auth-login');
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
              $data.initialize('cars')
                .then(function () {
                  nextTask();
                })
                .catch(function (err) {
                  console.log('err', err);
                  nextTask(err);
                });
            },

            function (nextTask) {
              $data.initialize('locations')
                .then(function () {
                  nextTask();
                })
                .catch(nextTask);
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
