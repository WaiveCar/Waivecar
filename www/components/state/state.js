function WaiveCarStateService(flowControl,$rootScope,$urlRouter,$state,fleetRule){
	this.flowControl=flowControl;
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
		},
		{
			name:'cars-show',
		}
	];
	this.mainFlow=this.flowControl.setStateFlow('main',states);
	this.$rootScope.$on('$stateChangeStart', 
		function(event, toState, toParams, fromState, fromParams){ 
			if(toState.name===self.accept){
				self.accept=null;
				return;
			}
			if(self.mainFlow.hasRulesForTransition(toState.name)){
				event.preventDefault();
				self.mainFlow.goTo(toState.name).then(
					function(redirectState){
						self.accept = toState.name;
						self.$state.go(toState,toParams);
					}
				)
				.catch(function(error){
				});
			}
			else{
				self.mainFlow.setState(toState.name,toParams);
			}
		
		}
	);
};
WaiveCarStateService.prototype.go = function(name,params) {
	this.$state.go(name,params);
};
angular.module('WaiveCar.state',[
	'FlowControl',
	'WaiveCar.state.rules'
])
.service('WaiveCarStateService', [
  'FlowControlService',
  '$rootScope',
  '$urlRouter',
  '$state',
  'FleetRulesService',
  WaiveCarStateService
]);