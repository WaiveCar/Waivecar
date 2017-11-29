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
    function setup() {
      $ble.setFunction('getBle', res.ble);
      $ble.setFunction('lock', res._lock);
    }

    res.status = function(params) {
      setup();
      return $ble.status(params.id);
    }

    res.connect = function(params) {
      console.log("trying to connect to " + params);
      setup();
      return $ble.nop(params.id).catch(function(){
        console.log("Failure ... Unable to contact " + params.id);
      });
    };
    res.lock = function(params) {
      setup();
      return $ble.lock(params.id).catch(function(){
        console.log("Failure ... using network"); 
        return res._lock(params);
      });
    };
    res.unlock = function(params) {
      setup();
      return $ble.unlock(params.id).catch(function(){
        console.log("Failure ... using network"); 
        return res._unlock(params);
      });
    };
    return res;
  }
]);
