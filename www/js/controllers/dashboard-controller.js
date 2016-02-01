'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

require('../services/progress-service');
require('../services/geofencing-service');

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
  var GeofencingService = $injector.get('GeofencingService');

  // $data is used to interact with models, never directly. If direct is required, $data should be refreshed.
  $scope.data = $data.active;
  $scope.service = $ride;

  this.locations = $data.instances.locations;

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

  this.openPopover = function(item) {
    $timeout(function () {
      this.selectedItem = item;
    }.bind(this));
    return true;
  }.bind(this);

  this.closePopover = function() {
    $timeout(function () {
      this.selectedItem = null;
    }.bind(this));
    return true;
  }.bind(this);

  var locking;
  this.lockCar = function (id) {
    if (locking === true) {
      return;
    }
    locking = true;
    $ride.lockCar(id)
      .then(function () {
        locking = false;
      })
      .catch(function (reason) {
        locking = false;
        if (reason && reason.code === 'IGNITION_ON') {
          showIngitionOnModal();
          return;
        }
        $message.error(reason);
      });
  };

  var ending;
  this.endRide = function (carId, bookingId) {
    if (ending === true) {
      return null;
    }

    var outsideModal;

    // Check that current position is within geofence coordinates
    GeofencingService.insideBoundary().then(function(inside) {
      if (inside) {
        // inside geofence -> continue as normal
        ending = true;
        $progress.showSimple(true);
        return $ride.isCarOn(carId)
          .catch(function (reason) {
            ending = false;
            $progress.hide();
            return $q.reject(reason);
          })
          .then(function (isCarOn) {
            ending = false;
            $progress.hide();
            if (isCarOn) {
              showIngitionOnModal();
              return;
            }
            $ride.setLocation('homebase');
            $state.go('end-ride-location', {id: bookingId});
          });
      } else {
        // Not inside geofence -> show error
        $modal('result', {
          icon: 'x-icon',
          title: 'Please head back to Santa Monica',
          actions: [{
            text: 'Ok',
            className: 'button-balanced',
            handler: function () {
              outsideModal.remove();
            }
          }]
        })
        .then(function (_modal) {
          _modal.show();
          outsideModal = _modal;
          outsideModal.show();
        });
      }
    });
  };

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

  function showIngitionOnModal () {
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
}


module.exports = angular.module('app.controllers').controller('DashboardController', [
  '$scope',
  '$rootScope',
  '$injector',
  DashboardController
]);
