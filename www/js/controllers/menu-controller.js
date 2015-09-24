'use strict';
var angular = require('angular');
require('../services/auth-service.js');

module.exports =
  angular.module('app.controllers').controller('MenuController', [
    '$scope',
    '$auth',
    '$state',
    function ($scope, $auth, $state) {
      $scope.$auth = $auth;

      $scope.logout = function(){
        $auth.logout();
        $state.go('auth');
      };

    }

  ]);
