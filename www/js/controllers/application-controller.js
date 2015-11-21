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

function ApplicationController ($rootScope, $scope, $injector) {

  var $state = $injector.get('$state');
  var LocationService = $injector.get('LocationService');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $session = $injector.get('$session');
  var $document = $injector.get('$document');
  var $q = $injector.get('$q');

  $rootScope.isInitialized = false;
  this.models = $data.instances;
  this.active = $data.active;

  function getWindowWidth() {
    return $document.width();
  }

  $document.on('resize', function() {
    this.windowWidth = getWindowWidth();
  });

  this.windowWidth = getWindowWidth();

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

  this.logout = function() {
    $auth.logout(function(err) {
      if (err) {
        return $message.error(err);
      }
      this.popover.hide();
      $state.go('landing');
    });

  };

  // this.locateMe = function() {
  //   LocationService.getLocation().then(function(deviceLocation) {
  //     $rootScope.currentLocation = deviceLocation;
  //   });

  // };

  this.fetch = function() {
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

  this.init = function() {
    if ($auth.isAuthenticated()) {
      this.fetch();
      return;
    }

    // TODO kill this with fire
    $scope.$watch(function() {
      return $auth.isAuthenticated();
    }, angular.bind(this, function(data) {
      if (data === true) {
        this.fetch();
      }
    }));
  };

  this.init();

}

module.exports =
  angular.module('app.controllers')
  .controller('ApplicationController', [
    '$rootScope',
    '$scope',
    '$injector',
    ApplicationController
  ]);
