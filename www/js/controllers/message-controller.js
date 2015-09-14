angular.module('app.controllers').controller('MessageController', [
  '$scope',
  '$state',
  function ($scope, $state) {
    'use strict';

    $scope.init = function () {};

    $scope.init();

    $scope.send = function () {
      console.warn('Not implemented');
      $state.go('messages-sent');

    };

  }

]);
