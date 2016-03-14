'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

require('../services/progress-service');
require('../services/geofencing-service');
require('../services/notification-service');

function DashboardController ($scope, $rootScope, $injector) {
  var $q = $injector.get('$q');
  var $ride = $injector.get('$ride');
  var $data = $injector.get('$data');
  var $distance = $injector.get('$distance');
  var $modal = $injector.get('$modal');
  var $message = $injector.get('$message');
  var $state = $injector.get('$state');
  var $timeout = $injector.get('$timeout');
  var $ionicLoading = $injector.get('$ionicLoading');
  var GeofencingService = $injector.get('GeofencingService');
  var homebase = $injector.get('homebase');

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  $scope.data = $data.active;
  $scope.service = $ride;
  var ctrl = this;
  this.locations = $data.instances.locations;

  console.log('locations: ', this.locations);

  this.openPopover = openPopover;
  this.closePopover = closePopover;
  this.lockCar = lockCar;
  this.unlockCar = unlockCar;
  this.endRide = endRide;

  // State
  this.ending = false;
  this.locking = false;
  this.unlocking = false;
  this.locked = false;

  var rideServiceReady = $scope.$watch('service.isInitialized', function(isInitialized) {
    if (isInitialized !== true) {
      return;
    }
    rideServiceReady();

    this.featured = featured(this.locations);
    var booking = $data.active.bookings;

    if (!(booking && booking.status === 'started')) {
      $state.go('cars');
      return;
    }
    this.timeLeft = moment(booking.updatedAt).add(90, 'm').toNow(true);
  }.bind(this));

  function openPopover(item) {
    $timeout(function () {
      ctrl.selectedItem = item;
    });
    return true;
  }

  function closePopover() {
    $timeout(function () {
      ctrl.selectedItem = null;
    });
    return true;
  }

  function lockCar(id) {

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (ctrl.locking === true) {
      return;
    }

    ctrl.locking = true;
    $ride.lockCar(id)
      .then(function () {
        $ionicLoading.hide();
        ctrl.locking = false;
        ctrl.locked = true;
      })
      .catch(function (reason) {
        $ionicLoading.hide();
        ctrl.locking = false;
        if (reason && reason.code === 'IGNITION_ON') {
          showIgnitionOnModal();
          return;
        }
        $message.error(reason);
      });
  }

  function unlockCar(id) {

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (ctrl.unlocking === true) {
      return;
    }

    ctrl.unlocking = true;
    $ride.unlockCar(id)
      .then(function () {
        $ionicLoading.hide();
        ctrl.unlocking = false;
        ctrl.locked = false;
      })
      .catch(function (reason) {
        $ionicLoading.hide();
        ctrl.unlocking = false;
        if (reason && reason.code === 'IGNITION_ON') {
          showIgnitionOnModal();
          return;
        }
        $message.error(reason);
      });
  }

  function endRide(carId, bookingId) {

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (ctrl.ending === true) {
      return null;
    }

    ctrl.ending = true;
    $ride.isChargeOkay(carId).then(function(okay) {
      ctrl.ending = false;
      if (okay || $distance(homebase) < 0.3) {
        return GeofencingService.insideBoundary();
      }
      $ionicLoading.hide();
      return $q.reject('Looks like the charge is pretty low.  Please head to the nearest charger!');
    }).then(function(inside) {
      if (inside) {
        // inside geofence -> continue as normal
        return $ride.isCarOn(carId)
          .catch(function (reason) {
            ctrl.ending = false;
            $ionicLoading.hide();
            return $q.reject(reason);
          })
          .then(function (isCarOn) {
            ctrl.ending = false;
            $ionicLoading.hide();
            if (isCarOn) {
              showIgnitionOnModal();
              return;
            }
            $ride.setLocation('homebase');
            $ride.processEndRide();
            $state.go('end-ride-location', {id: bookingId});
          });
      } else {
        // Not inside geofence -> show error
        $ionicLoading.hide();
        return $q.reject('Looks like you\'re outside of the rental zone (Santa Monica). Please head back to end your rental.');
      }
    }).catch(endRideFailure);
  }

  function featured (items) {
    return _(items)
      .sortBy(function (item) {
        if ($rootScope.currentLocation) {
          return $distance(item);
        }
        return item.id;
      })
      .take(2)
      .value();
  }

  function showIgnitionOnModal () {
    $ionicLoading.hide();
    var ignitionOnModal;
    $modal('result', {
      icon: 'x-icon',
      title: 'Please turn the car off',
      actions: [{
        text: 'Ok',
        className: 'button-balanced',
        handler: function () {
          ignitionOnModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      ignitionOnModal = _modal;
      ignitionOnModal.show();
    });
  }

  function endRideFailure(message) {
    $ionicLoading.hide();
    var endRideModal;

    $modal('result', {
      icon: 'x-icon',
      title: message,
      actions: [{
        text: 'Ok',
        className: 'button-balanced',
        handler: function () {
          endRideModal.remove();
        }
      }]
    })
    .then(function (_modal) {
      _modal.show();
      endRideModal = _modal;
      endRideModal.show();
    });
  }
}


module.exports = angular.module('app.controllers').controller('DashboardController', [
  '$scope',
  '$rootScope',
  '$injector',
  DashboardController
]);
