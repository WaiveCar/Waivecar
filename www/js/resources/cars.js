'use strict';
var angular = require('angular');
require('../services/utils.js');
require('../services/ble-service.js');

module.exports = angular.module('app').factory('Cars', [
  '$resource',
  '$utils',
  '$ble',
  '$timeout',
  '$q',
  function Resource($resource, $utils, $ble, $timeout, $q) {

    var res = $resource(null, null, $utils.createResource('cars', {
      _lock: {
        method: 'PUT',
        url: $utils.getCustomRoute('cars/:id/lock'),
        params: {
          id: '@id'
        }
      },
      _unlock: {
        method: 'PUT',
        url: $utils.getCustomRoute('cars/:id/unlock'),
        params: {
          id: '@id'
        }
      },
      ble: {
        url: $utils.getCustomRoute('cars/:id/ble'),
        params: {
          id: '@id'
        }
      },
      refresh: {
        method: 'PUT',
        url: $utils.getCustomRoute('cars/:id/refresh'),
        params: {
          id: '@id'
        }
      },
      query: {
        method: 'GET',
        url: $utils.getCustomRoute('cars'),
        isArray: true
      },
      notifyAvailability: {
        method: 'POST',
        url: $utils.getCustomRoute('cars/notify')
      }
    }));

    res.setup = function(kv) {
      $ble.setFunction('getBle', res.ble);
      $ble.setFunction('lock', res._lock);
      for(var key in kv) {
        $ble.setFunction(key, kv[key]);
      }
    }

    res.status = function(params) {
      return $ble.status(params.id);
    }

    res.disconnect = function(params) {
      return $ble.disconnect();
    }

    res.connect = function(params) {
      return $ble.connect(params.id).promise.catch(function(){
        console.log("Failure ... Unable to contact " + params.id);
        return $q.reject();
      });
    };

    res.lock = function(params) {
      return $ble.lock(params.id).promise.catch(function(){
        console.log("Failure ... using network");
        return res._lock(params).$promise;
      });
    };

    res.unlock = function(params) {
      var defer = $q.defer();
      var done = false;
      var bleHandle = $ble.unlock(params.id, done);

      bleHandle.promise.then(function() {
        console.log("BTLE successful unlock");
        done = true;
        return defer.resolve(true);
      }).catch(function() {
        console.log("Hit bt failure");
        done = false;
      });

      // ble actions usually complete in under 2 seconds,
      // if it hasn't then we do something a bit crazy
      $timeout(function() {
        console.log("Attempting to unlock");
        if(!done) {
          console.log("Partaking in attempt");
          return res._unlock(params).$promise
            .then(function(txt) {
              console.log("Server unlocked");
              done = true;
              return defer.resolve(txt);
            })
            .catch(defer.reject);
        }
      }, 1500);

      return defer.promise;
    };
    return res;
  }
]);
