'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');

module.exports = angular.module('app.controllers').controller('LandingController', [
  '$injector',
  function ($injector) {

    var $state = $injector.get('$state');
    var $auth = $injector.get('$auth');
    // var $ride = $injector.get('$ride');

    function init() {
      if (!$auth.isAuthenticated()) {
        return $state.go('auth');
      } else {
        return $state.go('cars');
       // return $ride.reroute();
      }
    };

    init();

  }
]);
