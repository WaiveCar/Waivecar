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
angular.module('app')
.controller('RideController', [
  RideController
])
.directive('batteryCharge', [
  batteryChargeDirective
])
.directive('distanceTravelled', [
  distanceTravelledDirective
]);