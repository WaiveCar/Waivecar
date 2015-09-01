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
            var active = _.find($data.models.bookings, function(b) {
              return _.contains([ 'new-booking', 'active' ], b.state);
            });
            if (active) {
              $state.go('bookings-edit', { id : active.id });
            } else {
              $state.go('cars');
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
