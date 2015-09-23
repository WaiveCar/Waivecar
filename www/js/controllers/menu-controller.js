'use strict';
var angular = require('angular');
require('../services/auth-service.js');

module.exports =
  angular.module('app.controllers').controller('MenuController', [
    '$scope',
    '$auth',
    function ($scope, $auth) {
      $scope.$auth = $auth;

    }

  ]);
