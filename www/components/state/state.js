function WaiveCarStateService(stateService,$rootScope,$urlRouter,$state,fleetRule){
	this.stateService=stateService;
	this.$rootScope = $rootScope;
	this.$urlRouter = $urlRouter;
	this.$state 	= $state;
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

			if(toState.name===self.accept){
				self.accept=null;
				return;
			}
			if(self.stateService.hasRulesForTransition('main',toState.name)){
				event.preventDefault();
				self.stateService.goTo('main',toState.name).then(
					function(redirectState){
						self.accept = toState.name;
						self.$urlRouter.sync();
					}
				)
				.catch(function(error){
					
				});
			}
		}
	);
};
angular.module('WaiveCar.state',[
	'State',
	'WaiveCar.state.rules'
])
.service('WaiveCarStateService', [
  'StateService',
  '$rootScope',
  '$urlRouter',
  '$state',
  'FleetRulesService',
  WaiveCarStateService
])