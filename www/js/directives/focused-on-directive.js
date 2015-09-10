angular.module('app.directives').directive('headerBar', [
  '$timeout',
  function ($timeout) {
    'use strict';
    return function ($scope, $element, $attrs) {
      var timeout = 500;

      function focus() {
        $timeout(function () {
          $element.focus();
          $timeout(function () {
            $element.select();
          }, timeout);
        }, timeout);
      }

      if (_($attrs.focusedOn).isEmpty()) {
        return focus();
      }

      $scope.$watch($attrs.focusedOn, function (newVal) {
        if (newVal) {
          focus();
        }
      });

    };

  }

]);
