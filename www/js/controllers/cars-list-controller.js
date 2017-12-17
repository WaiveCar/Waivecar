'use strict';
var angular = require('angular');
require('../services/distance-service');
require('../services/modal-service');
require('angular-ui-router');

module.exports = angular.module('app.controllers').controller('CarsListController', [
  '$rootScope',
  '$scope',
  '$state',
  '$injector',
  '$data',
  'cars',
  '$modal',
  CarsListController
]);

function CarsListController ($rootScope, $scope, $state, $injector, $data, cars, $modal) {
  var $distance = $injector.get('$distance');
  var modal;

  this.all = cars;

  cars.forEach(function(car) {
    car.model = car model || 'Ioniq',
    var stub = car.model.toLowerCase().split(' ')[0],
        multiplier;

    car.charge = Math.min(car.charge, 100) || 0;
    car.image = "https://waivecar.com/images/cars/" + stub + "_100.png";

    if(stub === 'ioniq') {
      multiplier = 1.35;
    } else {
      multiplier = 0.7;
    }

    car.range = car.charge * multiplier;
  });

  this.show = function showCar (car) {
    if (car.isAvailable === false) {
      showUnavailableModal();
      return;
    }
    // needs to be at least 10 miles from the car
    var distance = $distance(car);
    if (distance > 10) {
      showFarAwayModal();
      return;
    }
    $state.go('cars-show', {
      id: car.id
    });
    return;
  };

  function showUnavailableModal () {
    var unavailableModal;
    $modal('result', {
      icon: 'x-icon',
      title: 'This WaiveCar is unavailable right now',
      message: 'The green icons on the map are the available WaiveCars.',
      actions: [{
        text: 'Ok',
        handler: function () {
          unavailableModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      unavailableModal = _modal;
      unavailableModal.show();
    });
  }

  function showFarAwayModal () {
    var farModal;
    $modal('result', {
      icon: 'x-icon',
      title: 'You\'re too far away to rent this car',
      message: 'Get within 10 miles of the WaiveCar to book it.',
      actions: [{
        text: 'Close',
        handler: function () {
          farModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      farModal = _modal;
      farModal.show();
    });
  }

  $scope.$on('$destroy', function () {
    if (modal) {
      modal.remove();
    }
  });
}
