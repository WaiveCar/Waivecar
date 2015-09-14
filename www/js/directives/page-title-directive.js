angular.module('app.directives').directive('pageTitle', [

  function () {
    'use strict';

    return {
      restrict: 'E',
      transclude: true,
      templateUrl: '/templates/directives/page-title.html'
    };

  }

]);
