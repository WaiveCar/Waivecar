'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  function ($rootScope, $scope, $state) {

    $scope.showCar = function (marker, id) {
      $state.go('cars-show', {
        id: id
      });
    };

  }
]);
