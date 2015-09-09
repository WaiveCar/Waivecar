angular.module('app.controllers').controller('InspectionController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'MapsEvents',
  function ($rootScope, $scope, $state, $auth, $data, MapsEvents) {

    $scope.init = function() {
      if (!$auth.isAuthenticated()) {
        $state.go('auth');
      }

      $data.activate('bookings', $state.params.id, function(err) {
        $data.activate('cars', $data.active.bookings.carId, function(err) {
          var connected = $scope.$watch(function() {
            return true;
          }, function(newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
              connected();
              // TODO: move to dash
            }
          });
        })
      });
    };

    $scope.init();
  }
]);
