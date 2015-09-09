angular.module('app.directives').directive('pageTitle', [
  function () {
    return {
      restrict   : 'E',
      transclude : true,
      scope      : {
        'backButton':'@'
      },
      templateUrl :'/templates/directives/page-title.html'
    }
  }
]);