angular.module('app.controllers').controller('VehicleController', [
  '$rootScope',
  '$scope',
  '$state',
  '$account',
  '$auth',
  '$notification',
  '$config',
  '$http',
  '$data',
  function ($rootScope, $scope, $state, $account, $auth, $notification, $config, $http, $data) {

    $scope.active = $data.active;
    $scope.data = $data.data;

    $scope.executeCommand = function(command) {
      var url = [ $config.uri.api, 'vehicles', $state.params.id, 'commands', command ].join('/');
      $http.post(url).then(function(response) {
        $notification.success(command + ' has been successfully executed. Response: ' + response);
      }).catch(function(err) {
        $notification.error(err);
      });
    };

    $scope.unlock = function() {
      return $scope.executeCommand('unlock');
    };

    $scope.lock = function() {
      return $scope.executeCommand('lock');
    };

    $scope.start = function() {
      return $scope.executeCommand('start');
    };

    $scope.stop = function() {
      return $scope.executeCommand('stop');
    };

    $scope.chart = {
      labels: [ 'Available', 'Used' ],
      data: [ 0, 0 ],
      options: {
        percentageInnerCutout : 70,
      },
      colors: [ '#38A538', '#A9A9A9' ],
    };

    var initVehicle = function(next) {
      $data.fetch('vehicles', $state.params.id, next);
    };

    var activateVehicle = function(next) {
      $data.activate('vehicles', $state.params.id, next);
    }

    $scope.fetch = function(next) {
      async.series([ initVehicle, activateVehicle ], function(err) {
        $scope.chart.data[0] = $scope.active.vehicle.diagnostics['EV BATTERY LEVEL'].value;
        $scope.chart.data[1] = 100 - $scope.chart.data[0];
        $scope.initialized = true;
      });
    };

    $scope.init = function() {
      if ($account.initialized) {
        $scope.fetch();
      } else {
        // after account has been initialized
        $scope.$watch(function() { return $account.initialized; }, function(data) {
          if (data === true) {
            $scope.fetch();
          }
        });
      }
    };

    $scope.init();
  }
]);
