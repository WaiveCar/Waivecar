(function() {

 angular.module('app.modules.countdown.directives',['app.modules.countdown.controller'])
.directive('timer', [function() {
								return {
									templateUrl:'/js/modules/countdown/templates/timer.html',
									restrict: 'E',
									controllerAs:'timerCtrl',
									controller:'timerController'
								};
							}]
);
})();