function WaiveCarStateService(stateService,$rootScope,$urlRouter,fleetRule){
	this.stateService=stateService;
	this.$rootScope = $rootScope;
	this.$urlRouter = $urlRouter;
	this.fleetRule=fleetRule;
}
WaiveCarStateService.prototype.init = function() {
	var self=this;
	var states=[
		{
			name:'fleet',
			rules:self.fleetRule.getRules()
		}
	];
	self.stateService.setStateFlow('main',states);
	this.$rootScope.$on('$stateChangeStart', 
	function(event, toState, toParams, fromState, fromParams){ 
		event.preventDefault();
	});
};
angular.module('WaiveCar.state',[
	'State',
	'WaiveCar.state.rules'

])
.service('WaiveCarStateService', [
  'StateService',
  '$rootScope',
  '$urlRouter',
  'FleetRulesService',
  WaiveCarStateService
])