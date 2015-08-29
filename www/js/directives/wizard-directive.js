angular.module('app.directives').directive('wizard', [
  function () {
    function link(scope) {
      if (typeof scope.currentStep == 'undefined' || scope.currentStep <= 0) {
        scope.currentStep = 1;
      }

      if (scope.currentStep > 4) {
        scope.currentStep = 4;
      }
      for (var i=0; i < scope.currentStep; i++) {
        scope['step' + (i + 1)] = 'passed';
      }
    }

    return {
      restrict    : 'E',
      replace     : true,
      link        : link,
      scope       : {
        currentStep : '@'
      },
      templateUrl :'/templates/directives/wizard.html'
    }
  }
]);