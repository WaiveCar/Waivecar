'use strict';
var angular = require('angular');

module.exports = angular.module('app.directives')
  .directive('equalTo', [

    function advertisementDirective() {

      return {
        require: 'ngModel',
        link: function($scope, $elm, $attrs, ngModelCtrl) {
          function validator(value) {
            var compareAgainst = compareAgainst || $scope.$eval($attrs.equalTo);
            console.log('compareAgainst', compareAgainst, 'value', value);
            ngModelCtrl.$setValidity('equalTo', compareAgainst === value);
            return compareAgainst === value ? value : void 0;
          }

          ngModelCtrl.$parsers.unshift(validator);
          ngModelCtrl.$formatters.unshift(validator);

          $scope.$watch($attrs.equalTo, function(compareAgainst) {
            if (compareAgainst === null) {
              return;
            }
            validator(ngModelCtrl.$viewValue);
          });
        }
      };

    }

  ]);
