angular.module('app.directives').directive('wizard', [
  '$location',
  function ($location) {
    'use strict';

    function link(scope) {
      if (_(scope.currentStep).isUndefined() || scope.currentStep < 0) {
        scope.currentStep = 0;
      }

      if ($location.search().step) {
        scope.currentStep = $location.search().step;
      }

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

    return {
      restrict: 'E',
      // replace: true,
      link: link,
      scope: {
        currentStep: '@'
      },
      templateUrl: '/templates/directives/wizard.html'
    };

  }

]);
