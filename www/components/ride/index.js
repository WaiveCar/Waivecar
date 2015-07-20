function RideController(){

}
function distanceTravelledDirective(){
	function link(scope){
		scope.value='100 miles'
	}
	return {
		link:link,
		template:'<span ng-bind="value"></span>',
		scope:true
	}
}
function batteryChargeDirective(){
	function link(scope){
		scope.value='65%'
	}
	return {
		link:link,
		template:'<span ng-bind="value"></span>',
		scope:true
	}
}


function freeRideTimeDirective() {
  function link(scope, element, attrs, ctrl) {
    var durations = {'freeRide': 120};
    ctrl.createTimer('freeRide', durations);
    ctrl.start();
    var watchExpressions = [
      function() {
        return ctrl.seconds;
      },
      function() {
        return ctrl.minutes;
      },
      function() {
        return ctrl.seconds;
      }
    ];
    scope.$watchGroup(watchExpressions, function(newValues, oldValues, scope) {
      if (typeof ctrl.hours != 'undefined' && ctrl.hours > 0) {
        scope.timeLeftDisplay = ctrl.hours + ':' + ctrl.minutes + 'h';
      }      else if (typeof ctrl.minutes != 'undefined' && ctrl.minutes > 0) {
        scope.timeLeftDisplay = ctrl.minutes + ':' + ctrl.seconds + 'm';
      }      else if (typeof ctrl.seconds != 'undefined' && ctrl.seconds > 0) {
        scope.timeLeftDisplay = ctrl.seconds + 's';
      }      else {
        scope.timeLeftDisplay = '0:0:0';
      }
    });

  }
  return {
      restrict: 'E',
      templateUrl: 'components/ride/templates/directives/freeRideTime.html',
      link: link,
      controller: 'TimerController',
      controllerAs: 'timer',
      scope:false
    }

}

angular.module('app')
.controller('RideController', [
  RideController
])
.directive('batteryCharge', [
  batteryChargeDirective
])
.directive('distanceTravelled', [
  distanceTravelledDirective
])
.directive('freeRideTime',freeRideTimeDirective);