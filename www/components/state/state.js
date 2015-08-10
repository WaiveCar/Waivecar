function WaiveCarStateService(flowControl,$rootScope,$urlRouter,$state,fleetRule,carInfoRule){
	this.flowControl=flowControl;
	this.$rootScope = $rootScope;
	this.$urlRouter = $urlRouter;
	this.$state 	= $state;
	this.fleetRule = fleetRule;
	this.carInfoRule = carInfoRule;
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
			rules:self.carInfoRule.getRules()
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
						if(redirectState===true || toState.name == redirectState.name){
							self.accept = toState.name;
							self.$state.go(toState,toParams);
						}
						else{
							self.$state.go(redirectState.name,redirectState.params);
						}
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
angular.module('WaiveCar.state.rules',['WaiveCar.state.carInfoRules','WaiveCar.state.fleetRules']);
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
  'CarInfoRulesService',
  WaiveCarStateService
]);