'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('MessageController', [
  '$scope',
  '$state',
  function ($scope, $state) {

    $scope.init = function () {};

    $scope.init();

    $scope.send = function () {
      console.warn('Not implemented');
      $state.go('messages-sent');

    };

  }

]);
