angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  'MockLocationService',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, LocationService, $auth, $data) {

    $scope.showConnect = false;

    $scope.bookingDetail = function(type, detail) {
      var na = 'Unavailable';
      if (!$data.active || !$data.active.bookings || !$data.active.bookings.details) {
        return na;
      }

      var bookingDetail = _.find($data.active.bookings.details, { type: type });

      if (bookingDetail) {
        return bookingDetail[detail];
      }

      return na;
    }

    $scope.distance = function() {
      var from = $scope.bookingDetail('start', 'odometer');
      var to = $scope.bookingDetail('end', 'odometer');
      if (from === 'Unavailable' || to === 'Unavailable') return from;

      if (from && to) {
        return (to - from) + ' miles';
      }
    }

    $scope.duration = function() {
      var from = $scope.bookingDetail('start', 'time');
      var to = $scope.bookingDetail('end', 'time');
      if (from === 'Unavailable' || to === 'Unavailable') return from;

      return moment(from).from(to, true);
    }

    $scope.connect = function() {
      $state.go('bookings-prepare', { id : $data.active.bookings.id });
    };

    $scope.getDirections = function() {
      // TODO: use actual address.
      var url = [
        'comgooglemaps-x-callback://?',
        '&daddr=International+Airport',
        '&directionsmode=walking',
        '&x-success=WaiveCar://?resume=true',
        '&x-source=WaiveCar'
      ].join('');
      window.open(encodeURI(url), '_system');
    };

    $scope.cancel = function() {
      $data.remove('bookings', $data.active.bookings.id, function(err) {
        $state.go('cars');
      });
    };

    $scope.mockInRange = function() {
      LocationService.setLocation($data.active.cars.location);
    };

    $scope.mockOutOfRange = function() {
      LocationService.mockLocation();
      $scope.watchForWithinRange();
    };

    $scope.watchForWithinRange = function() {
      $scope.showConnect = false;
      var located = $scope.$watch(function() {
        if (!$rootScope.currentLocation) return false;
        if (!$data.active.cars) return false
        var from = L.latLng($rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude);
        var to = L.latLng($data.active.cars.location.latitude, $data.active.cars.location.longitude);
        var distance = from.distanceTo(to);
        console.log(distance);
        return distance <= 25;
      }, function(newValue, oldValue) {
        if (newValue && newValue !== oldValue) {
          located();
          $scope.showConnect = true;
          // we are now close enough to activate the car.
        }
      });
    }

    $scope.init = function() {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function(err) {
        $data.activate('cars', $data.active.bookings.carId, function(err) {
          if ($state.current.name === 'bookings-show') {
            return;
          }

          var booking = angular.copy($data.active.bookings);
          booking.state = 'pending-arrival';
          $data.update('bookings', booking, function(err) {
            if (err) {
              alert(err.message || err);
            } else {
              $scope.watchForWithinRange();
            }
          });
        })
      });
    };

    $scope.init();
  }
]);
