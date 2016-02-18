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
  var $progress = $injector.get('$progress');
  var $ionicLoading = $injector.get('$ionicLoading');
  var GeofencingService = $injector.get('GeofencingService');

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  $scope.data = $data.active;
  $scope.service = $ride;
  var ctrl = this;
  this.locations = $data.instances.locations;

  this.openPopover = openPopover;
  this.closePopover = closePopover;
  this.lockCar = lockCar;
  this.endRide = endRide;

  // State
  this.ending = false;
  this.locking = false;

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
      this.selectedItem = item;
    }.bind(this));
    return true;
  }

  function closePopover() {
    $timeout(function () {
      this.selectedItem = null;
    }.bind(this));
    return true;
  }

  function lockCar(id) {
    if (ctrl.locking === true) {
      return;
    }

    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    ctrl.locking = true;
    $ride.lockCar(id)
      .then(function () {
        $ionicLoading.hide();
        ctrl.locking = false;
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

  function endRide(carId, bookingId) {
    $ionicLoading.show({
      template: '<div class="circle-loader"><span>Loading</span></div>'
    });

    if (ctrl.ending === true) {
      return null;
    }

    ctrl.ending = true;
    $ride.isChargeOkay(carId).then(function(okay) {
      if (okay) {
        return GeofencingService.insideBoundary();
      }
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
            $state.go('end-ride-location', {id: bookingId});
          });
      } else {
        // Not inside geofence -> show error
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
