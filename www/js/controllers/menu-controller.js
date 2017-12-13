'use strict';
var angular = require('angular');
require('../services/auth-service.js');

function MenuController ($scope, $auth, $state, $data) {
  this.$auth = $auth;
  $scope.$data = $data;

  this.logout = function logout () {
    $auth.logout();
    $data.resources.cars.disconnect();
    $state.go('auth');
  };
}

module.exports =
  angular.module('app.controllers').controller('MenuController', [
    '$scope',
    '$auth',
    '$state',
    '$data',
    MenuController
  ]);
