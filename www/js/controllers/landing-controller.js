angular.module('app.controllers').controller('LandingController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {

    $scope.init = function() {

      if ($auth.isAuthenticated()) {
        $data.initialize('bookings', function(err) {
          if ($data.models.bookings) {
            var active = _.find($data.models.bookings, function(booking) {
              return _.contains([
                'new-booking',
                'payment-authorized',
                'pending-arrival',
                'in-progress',
                'pending-payment'
              ], booking.state);
            });
            if (!active) return $state.go('cars');
            console.log('active booking found (' + active.id + ' : ' + active.state +').');
            switch(active.state) {
              case 'in-progress'        : return $state.go('bookings-in-progress', { id : active.id });
              case 'pending-payment'    : return $state.go('bookings-show', { id : active.id });
              case 'new-booking'        :
              case 'payment-authorized' :
              case 'pending-arrival'    :
              default                   : return $state.go('bookings-edit', { id : active.id });
            }
            if (active) {

            } else {

            }
          }
        });
      } else {
        $state.go('auth');
      }
    };

    $scope.init();
  }
]);