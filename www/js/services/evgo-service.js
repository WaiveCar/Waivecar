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
        $data.resources.evgo.chargers().$promise.then(function(chargers){
          console.log('evgo call', chargers);
          return chargers;
        });
      }
    };
  }
]);
