angular.module('app.directives').directive('lined', [

  function () {
    'use strict';

    return {
      restrict: 'E',
      transclude: true,
      replace: true,
      templateUrl: '/templates/directives/lined.html'
    };

  }

]);
