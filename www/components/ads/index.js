function AdsController($scope,$state){
	this.$state=$state;
}
//Redirect if the redirect url is not valid

AdsController.prototype.handleStateValidity = function() {
	var redirectUrl=this.$state.params.redirectUrl;
	if(redirectUrl==null){
		this.goBackToState();
	}
};
AdsController.prototype.goBackToState = function() {
	this.$state.go('cars');
};
AdsController.prototype.goToRedirectUrl = function() {
	var redirectUrl=this.$state.params.redirectUrl;
	var redirectParams=this.$state.params.redirectParams;
	this.$state.go(redirectUrl,redirectParams);
};
function advertisementDirective($state,$timeout){
	var link=function(scope, element, attrs, ctrl){
		ctrl.handleStateValidity();
		var timeOutFn=function(){
			ctrl.goToRedirectUrl();
		}
		$timeout(timeOutFn, 5000);
	}
	return {
  		  templateUrl: 'components/ads/templates/directives/advertisement.html',
  		  controller:'AdsController',
  		  controllerAs:'ads',
  		  link:link
	}
}
angular.module('ads',[])
.directive('advertisement', [
	'$state',
	'$timeout',
	advertisementDirective
])
.controller('AdsController', [
  '$scope',
  '$state',
  AdsController
]);