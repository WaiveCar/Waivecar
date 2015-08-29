angular.module('app.controllers').controller('CarController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;

    $scope.carDiagnostic = function(type) {
      var na = 'Unavailable';
      if (!$scope.active || !$scope.active.cars || !$scope.active.cars.diagnostics) {
        return na;
      }

      var diagnostic = _.findWhere($scope.active.cars.diagnostics, { type: type });
      if (diagnostic) {
        return diagnostic.value + diagnostic.unit;
      }

      return na;
    }

    $scope.init = function() {
      $data.activate('cars', $state.params.id, function(err) {

      });
    };

    $scope.init();
  }
]);
