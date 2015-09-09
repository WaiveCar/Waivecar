angular.module('app.controllers').controller('BookingPrepareController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'MapsEvents',
  function ($rootScope, $scope, $state, $auth, $data, MapsEvents) {

    $scope.inspect = function() {
      // TODO: show booking-inspection modal.
      alert('problem reported');
    };

    $scope.init = function() {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function(err) {
        if ($data.active.bookings.state === 'in-progress') {
          $state.go('bookings-in-progress', { id : $data.active.bookings.id });
          return;
        }

        var booking = angular.copy($data.active.bookings);
        booking.state = 'start';
        $data.update('bookings', booking, function(err, updated) {
          if (err) {
            alert(err.message || err);
          } else {
            var connected = $scope.$watch(function() {
              console.log($data.active.bookings.state);
              return $data.active.bookings.state === 'in-progress';
            }, function(newValue, oldValue) {
              if ($data.active.bookings.state === 'in-progress') {
                connected();
                $state.go('bookings-in-progress', { id : $data.active.bookings.id });
              }
            });
          }

          // TODO: b) TRIGGER CALL TO UNLOCK CAR
          // TODO: c) TRIGGER CALL TO ENABLE START
          // (b. & c. may be automatically triggered via a.)
        });
      });
    };

    $scope.init();
  }
]);
