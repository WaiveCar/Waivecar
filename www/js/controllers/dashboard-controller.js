'use strict';
var angular = require('angular');
var moment = require('moment');
var _ = require('lodash');

function DashboardController ($scope, $rootScope, $injector) {
  var $ride = $injector.get('$ride');
  var $data = $injector.get('$data');
  var $distance = $injector.get('$distance');
  var $modal = $injector.get('$modal');
  var $message = $injector.get('$message');
  var $state = $injector.get('$state');
  var $timeout = $injector.get('$timeout');

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

    if (booking == null) {
      return;
    }
    if (booking.status === 'started') {
      this.timeLeft = moment(booking.updatedAt).add(90, 'm').toNow(true);
    }
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

  this.lockCar = function (id) {
    $ride.lockCar(id)
      .catch(function (reason) {
        if (reason && reason.code === 'IGNITION_ON') {
          showIngitionOnModal();
          return;
        }
        $message.error(reason);
      });
  };

  this.endRide = function (carId, bookingId) {
    return $ride.isCarOn(carId)
      .then(function (isCarOn) {
        if (isCarOn) {
          showIngitionOnModal();
          return;
        }
        $state.go('end-ride-options', {id: bookingId});
      });
  };

  function featured (items) {
    return _(items)
      .sortBy(function (item) {
        if ($rootScope.currentLocation) {
          return $distance.getDistance(item);
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
