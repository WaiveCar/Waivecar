function WaiveCarStateService(stateService,$rootScope){
	this.stateService=stateService;
	this.$rootScope = $rootScope;
}
WaiveCarStateService.prototype.init = function() {
	this.$rootScope.$on('$stateChangeStart', 
	function(event, toState, toParams, fromState, fromParams){ 
		/*console.log("STATE  CHANGE");
		console.log(toState);
		console.log(fromParams);
		event.preventDefault()*/
	});
};
angular.module('WaiveCar.state',['State'])
.service('WaiveCarStateService', [
  'StateService',
  '$rootScope',
  WaiveCarStateService
])