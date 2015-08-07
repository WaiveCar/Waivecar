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
		}
	];
	self.flowControl.setStateFlow('main',states);
	this.$rootScope.$on('$stateChangeStart', 
		function(event, toState, toParams, fromState, fromParams){ 

			if(toState.name===self.accept){
				self.accept=null;
				return;
			}
			if(self.flowControl.hasRulesForTransition('main',toState.name)){
				event.preventDefault();
				self.flowControl.goTo('main',toState.name).then(
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