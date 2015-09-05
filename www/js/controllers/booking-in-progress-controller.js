angular.module('app.controllers').controller('BookingInProgressController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'MapsEvents',
  function ($rootScope, $scope, $state, $auth, $data, MapsEvents) {

    $scope.end = function() {
      var booking = angular.copy($data.active.bookings);
      booking.state = 'end';
      $data.update('bookings', booking, function(err) {
        if (err) {
          alert(err.message || err);
        } else {
          $state.go('bookings-show', { id : $data.active.bookings.id });
        }
      });
    };

    $scope.init = function() {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function(err) {
        $data.activate('cars', $data.active.bookings.carId, function(err) {

        });
      });
    };

    $scope.init();
  }
]);
