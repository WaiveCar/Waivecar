function timeToGetToCarDirective(searchEvents, $state) {
  function link(scope,element,attrs,ctrl){
    var durations={'timeToCar':15};
    ctrl.createTimer('getToWaiveCar',durations);
    ctrl.start();
    var watchExpressions=[
      function(){
          return ctrl.seconds;
      },
      function(){
          return ctrl.minutes;
      },
      function(){
          return ctrl.seconds;
      }
    ];
    scope.$watchGroup(watchExpressions, function(newValues, oldValues, scope) {
          if(typeof ctrl.hours !='undefined' && ctrl.hours>0){
            scope.timeLeftDisplay=ctrl.hours+':'+ctrl.minutes+' hours left';
          }
          else if(typeof ctrl.minutes !='undefined' && ctrl.minutes>0){
            scope.timeLeftDisplay=ctrl.minutes+':'+ctrl.seconds+' minutes left';
          }
          else if(typeof ctrl.seconds !='undefined' && ctrl.seconds>0){
            scope.timeLeftDisplay=ctrl.seconds+' seconds left';
          }
          else{
              scope.timeLeftDisplay='no time left';

          }
    });

  }
 return {
      restrict:'E',
      templateUrl:'components/time-to-get-to-car/templates/index.html',
      link:link,
      controller:'TimerController',
      controllerAs:'timer'
    }

}

angular.module('app')
.directive('timeToGetToCar', [
  'searchEvents',
  '$state',
  timeToGetToCarDirective
]);