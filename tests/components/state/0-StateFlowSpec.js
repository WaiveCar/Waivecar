describe('State Flow',function(){
	var $q;
	var flags={
		hasRulesForTransition : true
	};
	var mockState={
		go:jasmine.createSpy('go')
	};
	var mockFleetRules={
		getRules:jasmine.createSpy('getRules')
	};
	var mockUrlRouter={
	};
	var mockFlow={
		goTo:function(flowName,stateName){
			if(flags.goTo===true){
				return $q.resolve(stateName);
			}
			return $q.reject(new Error());
		},
		hasRulesForTransition:function(flowName,stateName){
			return flags.hasRulesForTransition;
		}
	};
	var mockFlowService={
		setStateFlow:function(name,states){
			return mockFlow;
		}
	}
	function resetCalls(spy){
		if(spy.calls){
			spy.calls.reset();
		}
	}
	beforeEach(function(){
		var self=this;

		angular.module('FlowControl',[]);
		angular.module('WaiveCar.state.rules',[]);
		angular.mock.module('WaiveCar.state',function($provide){
			$provide.value('$state', mockState);
			$provide.value('FlowControlService', mockFlowService);
			$provide.value('$urlRouter',mockUrlRouter);
			$provide.value('FleetRulesService',mockFleetRules);
		});
		angular.mock.inject(function($rootScope,_$q_,WaiveCarStateService){
			self.$q=_$q_;
			$q=_$q_;

			self.$rootScope=$rootScope;
			self.scope  = $rootScope.$new();
			spyOn(this.$rootScope, '$on').and.callThrough();
			self.service=WaiveCarStateService;
		});
	});
	it('Initializes by listening to the state provider changes and preventing the flow',function(){
		this.service.init();
		var lastArgs=this.$rootScope.$on.calls.mostRecent().args;
		expect(lastArgs[0]).toEqual('$stateChangeStart');
 	});
 	describe('State controle',function(){
 		var eventBeingBroadcast;
 		var beforeEventSpy=function(event){
 			eventBeingBroadcast=event;
			spyOn(eventBeingBroadcast, 'preventDefault').and.callThrough();

 		};
 		var afterEventSpy=function(){

 		};
 		beforeEach(function(){
			spyOn(mockFlow, 'goTo').and.callThrough();
			flags.hasRulesForTransition=true;
 			this.$rootScope.$on('$stateChangeStart',beforeEventSpy);
			this.service.init();
			this.$rootScope.$on('$stateChangeStart',afterEventSpy);

 		});

		it('Prevents a state change if the transition has some rule to apply',function(){
			this.$rootScope.$emit('$stateChangeStart', {name:'fleet'});
			expect(eventBeingBroadcast.preventDefault).toHaveBeenCalled();
		});
		it('Check for state upon arrival  ',function(){
			this.$rootScope.$emit('$stateChangeStart', {name:'fleet'});
			expect(mockFlow.goTo.calls.mostRecent().args).toEqual(['fleet']);
		});
		it('Proceeds with the state if a promise is suceeded',function(){
			resetCalls(mockState.go);
			flags.goTo=true;
			this.$rootScope.$emit('$stateChangeStart', {name:'fleet'});
			this.$rootScope.$digest();
			expect(mockState.go).toHaveBeenCalled();
			//For some reason sync reemits $stateChangeStart right now
			resetCalls(eventBeingBroadcast.preventDefault);
			resetCalls(mockState.go);
			this.$rootScope.$emit('$stateChangeStart', {name:'fleet'});
			this.$rootScope.$digest();
			expect(eventBeingBroadcast.preventDefault).not.toHaveBeenCalled();
			expect(mockState.go).not.toHaveBeenCalled();
		});
		it('Does\'t prevents the state if there are no rules for the state',function(){
			flags.hasRulesForTransition=false;
			this.$rootScope.$emit('$stateChangeStart', {name:'fleet'});
			this.$rootScope.$digest();
			expect(eventBeingBroadcast.preventDefault).not.toHaveBeenCalled();
			expect(mockState.go).not.toHaveBeenCalled();
		});
		it('Doesn\'t procced  with the state if the state is rejected',function(){
			resetCalls(mockState.go);
			flags.goTo=false;
			this.$rootScope.$emit('$stateChangeStart', {name:'fleet'});
			this.$rootScope.$digest();
			expect(mockState.go).not.toHaveBeenCalled();

		});
 	});
	describe('Fleet',function(){
	/*	it('Doesn\'t show the fleet if we don\'t have the location');
		it('Shoes the fleet if we have the location');
		it('If everything is ok goes to car info after fleet');*/
	});
	describe('Car info',function(){
		it('Shows if the car is available');
		it('Do not show if the car is booked');
		it('Do not show if the car is not available');
		it('If the user is not logged he goes to signIn/signUp');
		it('If the user is logged it goes to booking');
	});
	describe('Sign in',function(){
		it('The user can sign in coming from any screen');
		it('After signing in the user goes to the previous state that required him to sign in');
	});
	describe('Sign up',function(){
		it('The user can sign up coming from any screen');
		describe('Personal Data',function(){
			it('Uppon a accepted personal data the user goes to the driver\'s license registration');
		});
		describe('Drivers license registration',function(){
			it('After registring the driver license the user goes to a paying method registration')
		});
		describe('Paying method',function(){	
			it('After registring a paying method the users goes back to the state that required him to sing up');
		});
	});
	describe('Booking',function(){
		it('The user can\'t book if he\'s  not logged in');
		it('The user can\'t book if he\'s paying methos is not active');
		it('The user can\'t book if the car is unavailable');
		describe('Connect to car',function(){
			it('Can only connect if the user owns the booking relative to this car');
			it('After the connect to car the user goes to the connecting and access damage ');
		});
		describe('car damage',function(){
			it('The user can only check the damage if he is on the connection of the car');
			it('After confirm that the user accept the car conditions he can interact with the car');
		});
	});
	describe('Riding',function(){
		describe('Free ride',function(){
			it('The user starts the ride as a free ride');
			it('After the time of the ride expires the user goes to a paid ride alert');
			it('If the battery is below the critical a battery alert is displayed ');
			it('The user can end the ride any time of the free ride');
		});
		describe('End ride',function(){
			it('The user can either leave the car charging or search for nearby charging statons');
			it('If the user end the ride without the car charging he goes to the summary');
			it('If the user end the ride with the car charging he goes to the summary');
		});
		describe('Paid ride',function(){
			it('The user can go to the paid  ride only before the free ride');
			it('If the battery is below the critical a battery alert is displayed ');
		});
	});
});