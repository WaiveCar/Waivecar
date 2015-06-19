angular.module('app.controllers').controller('VehicleController', [
  '$rootScope',
  '$scope',
  '$http',
  '$state',
  '$account',
  '$data',
  '$config',
  function($rootScope, $scope, $http, $state, $account, $data, $config) {
    'use strict';

    $scope.active = $data.active;
    $scope.data = $data.data;

    $scope.inprogress = false;

    $scope.executeCommand = function(command) {
      var id = $state.params.id || '1G1RD6E47BU000008'; //test
      var url = [ $config.uri.api, 'vehicles', id, 'commands', command ].join('/');
      $scope.inprogress = true;
      $http.post(url).then(function(response) {
        alert(command + ' has been successfully executed. Response: ' + response);
        $scope.inprogress = false;
      }).catch(function(err) {
        alert(err);
        $scope.inprogress = false;
      });
    };

    $scope.unlockVehicle = function() {
      return $scope.executeCommand('unlock');
    };

    $scope.lockVehicle = function() {
      return $scope.executeCommand('lock');
    };

    $scope.enableVehicle = function() {
      return $scope.executeCommand('start');
    };

    $scope.disableVehicle = function() {
      return $scope.executeCommand('stop');
    };

    var initVehicle = function(next) {
      if ($data.data.vehicles.length === 0) {
        $data.init('vehicles', next);
      } else {
        return next();
      }
    };

    var activateVehicle = function(next) {
      $data.activate('vehicles', $state.params.id, next);
    }

    $scope.fetch = function(next) {
      async.series([ initVehicle, activateVehicle ], function(err) {
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
