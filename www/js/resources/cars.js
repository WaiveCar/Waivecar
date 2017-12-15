'use strict';
var angular = require('angular');
require('../services/utils.js');
require('../services/ble-service.js');

module.exports = angular.module('app').factory('Cars', [
  '$resource',
  '$utils',
  '$ble',
  function Resource($resource, $utils, $ble) {

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
      return $ble.connect(params.id).catch(function(){
        console.log("Failure ... Unable to contact " + params.id);
      });
    };

    res.lock = function(params) {
      return $ble.lock(params.id).catch(function(){
        console.log("Failure ... using network"); 
        return res._lock(params).$promise;
      });
    };

    res.unlock = function(params) {
      return $ble.unlock(params.id).catch(function(){
        console.log("Failure ... using network"); 
        return res._unlock(params).$promise;
      });
    };
    return res;
  }
]);
