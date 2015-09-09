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
      if (!$auth.isAuthenticated()) return $state.go('auth', { redirectState : 'cars-show', redirectParams : { carId : $state.params.id } });

      async.waterfall([
        function(nextTask) {
          $data.resources.users.me(function(me) {
            $data.me = me.toJson ? me.toJson() : me;
            return nextTask(null, me);
          });
        },
        function(me, nextTask) {
          $data.create('bookings', { carId : $state.params.id, userId : me.id }, nextTask);
        }
      ], function(err, booking) {
        if (err) {
          alert(err.message || err);
        } else {
          $state.go('bookings-edit', { id : booking.id });
        }
      });
    };

    $scope.init = function() {
      $data.activate('cars', $state.params.id, function(err) {
        console.log('active car set to ' + $data.active.cars.id);

        // $rootScope.$broadcast(MapsEvents.destinyOnRouteChanged, $data.active.cars.location);
        //$rootScope.$broadcast(self.searchEvents.vehicleSelected, data);


      });
    };

    $scope.init();
  }
]);
