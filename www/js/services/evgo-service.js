'use strict';
var angular = require('angular');
var _ = require('lodash');
require('../resources/evgo-chargers.js');

module.exports = angular.module('app.services').factory('EvgoService', [
  '$injector',
  function($injector){
    var $data = $injector.get('$data');

    return {
      getAvailableChargers: function(){
        return $data.resources.evgo.chargers().$promise;
      }
    };
  }
]);
