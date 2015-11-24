'use strict';
var angular = require('angular');
require('../services/auth-service.js');

function MenuController ($scope, $auth, $state) {
  this.$auth = $auth;

  this.logout = function logout () {
    $auth.logout();
    $state.go('auth');
  };
}

module.exports =
  angular.module('app.controllers').controller('MenuController', [
    '$scope',
    '$auth',
    '$state',
    MenuController
  ]);
