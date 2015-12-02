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

function ApplicationController ($rootScope, $scope, LocationService, $injector) {

  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $document = $injector.get('$document');

  this.models = $data.instances;
  this.active = $data.active;

  function getWindowWidth() {
    return $document.width();
  }

  $document.on('resize', function() {
    this.windowWidth = getWindowWidth();
  }.bind(this));

  this.windowWidth = getWindowWidth();

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

  $rootScope.$on('authLogin', function () {
    initLocation();
  });

  if ($auth.isAuthenticated()) {
    initLocation();
    $auth.loadSession();
  }

  function initLocation () {
    LocationService.initPositionWatch();
    return $data.initialize('locations')
      .catch(function (err) {
        return $message.error(err);
      });
  };
}

module.exports =
  angular.module('app.controllers')
  .controller('ApplicationController', [
    '$rootScope',
    '$scope',
    'MockLocationService',
    '$injector',
    ApplicationController
  ]);
