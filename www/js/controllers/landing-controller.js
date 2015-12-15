'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');

module.exports = angular.module('app.controllers').controller('LandingController', [
  '$scope',
  '$state',
  '$auth',
  function ($scope, $state, $auth) {

    function init() {
      if (!$auth.isAuthenticated()) {
        return $state.go('auth');
      } else {
        return $state.go('cars');
      }
    };

    init();

  }
]);
