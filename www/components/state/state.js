function WaiveCarStateService(flowControl,
							$rootScope,
							$urlRouter,
							$state,
							fleetRule,
							carInfoRule,
							registerRule){
	this.flowControl=flowControl;
	this.$rootScope = $rootScope;
	this.$urlRouter = $urlRouter;
	this.$state 	= $state;
	this.fleetRule = fleetRule;
	this.carInfoRule = carInfoRule;
	this.registerRule=registerRule;
}
WaiveCarStateService.prototype.init = function() {
	var self=this;
	var states=[
		{name :'intro'},
		{name:'loginSignUp'},
		//Sign In flow
		{name:'signIn'},
		//Registering flow, maybe move it to a flow
		{
			name:'users-new',
			rules:self.registerRule.getRules()
		},
		{
			name: 'license-photo'
		},
		{
			name: 'license-details'
		},
		{
			name:'credit-cards',
		},
		//Password revoery flow
		{
			name:'passwordRecovery'
		},
		{
			name:'passwordEmailInfo'
		},
		//Flow prior to this is on the right order
		{
			name:'licenses-new'
		},
		{
			name:'users-show'
		},
		{
			name:'fleet',
			rules:self.fleetRule.getRules()
		},
		{
			name:'cars-show',
			rules:self.carInfoRule.getRules()
		},
		{
			name:'bookings-show'
		},
		{
			name:'ads'
		},
	];
	this.mainFlow=this.flowControl.setStateFlow('main',states);
	this.$rootScope.$on('$stateChangeStart', 
		function(event, toState, toParams, fromState, fromParams){ 
			if(toState.name===self.accept){
				self.accept=null;
				return;
			}
			try{
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
			catch(e){
				//Ignoring error from now
			}
		}
	);
};
WaiveCarStateService.prototype.previous = function(params) {
	var self=this;
	this.mainFlow.previous(params).then(function(redirectState){
		if(!redirectState.isRedirect){
			self.accept=redirectState.name;
		}
		self.$state.go(redirectState.name,redirectState.params)
	});

};
WaiveCarStateService.prototype.next = function(params) {
	var self=this;
	console.log('NEXT');
	console.log(params);
	this.mainFlow.next(params).then(function(redirectState){
		if(!redirectState.isRedirect){
			self.accept=redirectState.name;
		}
		console.log('REDIRECT STATE PARAMS');
		console.log(redirectState);
		self.$state.go(redirectState.name,redirectState.params)

	})
	.catch(function(error){
		console.log(error);
	});
	
};
WaiveCarStateService.prototype.go = function(name,params) {
	this.$state.go(name,params);
};
function nextStateDirective(WaiveCarStateService){
	function link(scope, element, attrs,ctrl){
		element.bind('click', function() {
			WaiveCarStateService.next(scope.params);
		});
	}
	return {
		restrict:'A',
		link:link,
		scope:{
			params:'='
		}
	}
}
function previousStateDirective(WaiveCarStateService){
	function link(scope, element, attrs,ctrl){
		element.bind('click', function() {
			WaiveCarStateService.previous(scope.params);
		});
	}
	return {
		restrict:'A',
		link:link,
		scope:{
			params:'=',
			
		}
	}
}
function goToStateDirective(WaiveCarStateService){
	function link(scope, element, attrs,ctrl){
		element.bind('click', function() {
			WaiveCarStateService.go(scope.name,scope.params);
		});
	}
	return {
		restrict:'A',
		link:link,
		scope:{
			params:'=',
			name:'@'
		}
	}
}


angular.module('WaiveCar.state.rules',['WaiveCar.state.carInfoRules','WaiveCar.state.fleetRules','WaiveCar.state.registerRules']);
angular.module('WaiveCar.state',[
	'FlowControl',
	'WaiveCar.state.rules'
])
.directive('nextState', [
  'WaiveCarStateService',
  nextStateDirective
])
.directive('previousState', [
  'WaiveCarStateService',
  previousStateDirective
])
.directive('goToState', [
  'WaiveCarStateService',
  goToStateDirective
])
.service('WaiveCarStateService', [
  'FlowControlService',
  '$rootScope',
  '$urlRouter',
  '$state',
  'FleetRulesService',
  'CarInfoRulesService',
  'RegisterRulesService',
  WaiveCarStateService
]);