(function() {
  angular.module('app')
  .directive('timer', [
    function() {
  		return {
  			templateUrl:'/components/countdown/templates/timer.html',
  			restrict: 'E',
  			controllerAs:'timerCtrl',
  			controller:'timerController'
  		};
  	}
  ]);
})();