describe('State Flow',function(){
	var mockState={
		go:jasmine.createSpy('go')
	}
	 beforeEach(function(){
		var self=this;
		
		angular.mock.module('WaiveCar.state',function($provide){
			$provide.value("$state", mockState);
		});
		angular.mock.inject(function(StateService,$rootScope,WaiveCarStateService){
			self.stateService=StateService;
			self.$rootScope=$rootScope;
			self.scope  = $rootScope.$new();
			spyOn(this.$rootScope, '$on');
			self.service=WaiveCarStateService;
		});
	});
	it('Initializes by listening to the state provider changes and preventing the flow',function(){
		this.service.init();
		var lastArgs=this.$rootScope.$on.calls.mostRecent().args;
		expect(lastArgs[0]).toEqual('$stateChangeStart');
 	});
	describe('Fleet',function(){
		it('Doesn\'t show the fleet if we don\'t have the location');
		it('Shoes the fleet if we have the location');
		it('If everything is ok goes to car info after fleet');
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