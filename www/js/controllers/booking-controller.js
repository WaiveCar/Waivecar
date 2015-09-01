angular.module('app.controllers').controller('BookingController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {

    // $scope.update = function() {
    //   $data.create('bookings', { carId : $state.params.carId, userId : $data.me.id }, function(err, booking) {
    //     $state.go('bookings-edit', { id : booking.id });
    //   });
    // };

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

    $scope.init = function() {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }
      $data.activate('bookings', $state.params.id, function(err) {
        console.log($data.active.bookings);
      });
    };

    $scope.init();
  }
]);
