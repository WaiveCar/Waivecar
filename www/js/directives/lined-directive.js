'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives').directive('lined', [

  function () {

    return {
      restrict: 'E',
      transclude: true,
      templateUrl: '/templates/directives/lined.html'
    };

  }

]);
