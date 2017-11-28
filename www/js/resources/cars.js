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
    res.connect = function(params) {
      console.log("trying to connect to " + params);
      $ble.setFunction('getBle', res.ble);
      return $ble.nop(params.id).catch(function(){
        console.log("Failure ... Unable to contact " + params.id);
      });
    };
    res.lock = function(params) {
      $ble.setFunction('getBle', res.ble);
      return $ble.lock(params.id).catch(function(){
        console.log("Failure ... using network"); 
        return res._lock(params);
      });
    };
    res.unlock = function(params) {
      $ble.setFunction('getBle', res.ble);
      return $ble.unlock(params.id).catch(function(){
        console.log("Failure ... using network"); 
        return res._unlock(params);
      });
    };
    return res;
  }
]);
