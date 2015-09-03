angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'MapsEvents',
  function ($rootScope, $scope, $state, $auth, $data, MapsEvents) {

    $scope.carDiagnostic = function(type) {
      var na = 'Unavailable';
      if (!$data.active || !$data.active.cars || !$data.active.cars.diagnostics) {
        return na;
      }

      var diagnostic = _.findWhere($data.active.cars.diagnostics, { type: type });
      if (diagnostic) {
        return diagnostic.value + diagnostic.unit;
      }

      return na;
    }

    $scope.book = function() {
      if ($auth.isAuthenticated() && $data.me) {
        $data.create('bookings', { carId : $state.params.id, userId : $data.me.id }, function(err, booking) {
          $state.go('bookings-edit', { id : booking.id });
        });
      } else {
        $state.go('auth', { redirectState : 'cars-show', redirectParams : { carId : $state.params.id } });
      }
    };

    $scope.init = function() {
      $data.activate('cars', $state.params.id, function(err) {
        console.log('active car set to ' + $data.active.cars.id);

        $rootScope.$broadcast(MapsEvents.destinyOnRouteChanged, $data.active.cars.location);
        //$rootScope.$broadcast(self.searchEvents.vehicleSelected, data);


      });
    };

    $scope.init();
  }
]);
