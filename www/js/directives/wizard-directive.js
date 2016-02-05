'use strict';
var angular = require('angular');
var _ = require('lodash');

module.exports = angular.module('app.directives').directive('wizard', [
  '$stateParams',
  function ($stateParams) {

    function link(scope) {

      function applyState(){

        if (_(scope.currentStep).isUndefined() || scope.currentStep < 0) {
          scope.currentStep = 0;
        }

        scope.currentStep = $stateParams.step ? parseInt($stateParams.step, 10) : 0;

        if (scope.currentStep > 4) {
          scope.currentStep = 4;
        }

        for (var i = 0; i < scope.currentStep; i++) {
          scope['step' + (i + 1)] = 'passed';
        }

        scope.data = {
          currentStep: scope.currentStep
        };

      }

      scope.$on('$stateChangeSuccess', applyState);

    }

    return {
      restrict: 'E',
      link: link,
      scope: {
        currentStep: '@'
      },
      templateUrl: '/templates/directives/wizard.html'
    };

  }

]);
