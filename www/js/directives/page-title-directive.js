'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives').directive('pageTitle', [

  function () {

    return {
      restrict: 'E',
      transclude: true,
      templateUrl: '/templates/directives/page-title.html'
    };

  }

]);
