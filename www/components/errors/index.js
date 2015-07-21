function ErrorController($state,$scope,errorMessages){
	var stateName=$state.current.name;
	this.message=errorMessages[stateName];
}
angular.module('app')
.constant('errorMessages', {
  'location-error':'We were not able to find your location,please reconnect',
  'unplugged-error':'It seems like you haven’t plugged the Waivecar.'
  })
.controller('ErrorController',['$state','$scope','errorMessages',ErrorController]);