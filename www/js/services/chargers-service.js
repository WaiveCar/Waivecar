'use strict';
var angular = require('angular');
var _ = require('lodash');
require('../resources/car-chargers.js');

module.exports = angular.module('app.services').factory('ChargersService', [
  '$injector',
  function($injector){
    var $data = $injector.get('$data');

    return {
      getAvailableChargers: function(){
        return $data.resources.chargers.list().$promise;
      }
    };
  }
]);
