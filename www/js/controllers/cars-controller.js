'use strict';
var angular = require('angular');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  'cars',
  CarsController
]);

function CarsController ($rootScope, $scope, $state, $injector, cars) {
  var $ionicModal = $injector.get('$ionicModal');

  this.all = cars;
  if (!this.all.length) {
    var modalScope = $rootScope.$new();
    $ionicModal.fromTemplateUrl('/templates/cars/modal-no-cars.html', {
      scope: modalScope,
      animation: 'fade-in-up'
    })
    .then(function (modal) {
      modalScope.close = modal.remove.bind(modal);

      $scope.$on('$destroy', function () {
        modal.remove();
      });
      return modal.show();
    });
  }

  this.showCar = function (car) {
    $state.go('cars-show', {
      id: car.id
    });
  };
}

