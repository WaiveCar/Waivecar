angular.module('app.directives')
  .directive('loadingContainer', [
    '$loading',
    function ($loading) {
      'use strict';

      return function ($scope) {
        $scope.hide = $loading.hide;
      };

    }

  ]);
