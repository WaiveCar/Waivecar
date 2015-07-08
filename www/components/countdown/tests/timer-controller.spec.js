describe('Countdown timer controller',function(){
	var scope; //we'll use this scope in our tests
	var ctrl;
	var theInterval;
	var rootScope;
	var mockTimerService;

	beforeEach(function() {
		mockTimerService = {
			getEllapsedSeconds:function(){
				return 0;
			},
			getEllapsedMinutes:function(){
				return 0;
			},
			getEllapsedHours:function(){
				return 0;
			},
			getStatus:function(){
				return 'freeRide';
			},
			start:function(){
				rootScope.$broadcast('waivecarCounterStarted','freeRide',105);
			},
			cancel:function(){
				rootScope.$broadcast('waivecarCounterCancelled','freeRide',105);
			}
		};

		angular.mock.module('app');
		angular.mock.inject(function($rootScope, $controller, $interval) {
			theInterval = $interval;
			//create an empty scope
			scope = $rootScope.$new();
			rootScope = $rootScope;
			ctrl = $controller('TimerController', { $scope: scope, $interval: $interval, Timer: mockTimerService });
		});
	});
	it('Starts a timer on count',function(){
		spyOn(mockTimerService, 'start').and.callThrough();
		ctrl.start();
		expect(mockTimerService.start).toHaveBeenCalled();
		theInterval.flush(1200);
		expect(ctrl.minutes).toEqual(0);
		expect(ctrl.seconds).toEqual(1);
	});
	it('Stops counting when cancel is reached',function(){
		spyOn(mockTimerService,'cancel').and.callThrough();
		ctrl.start();
		theInterval.flush(1200);
		ctrl.cancel();
		//_stopInterval
		expect(mockTimerService.cancel).toHaveBeenCalled();
		expect(ctrl._stopInterval).not.toBeDefined();
	});
	it('Changes status ',function(){
		var newStatus='foo';
		rootScope.$broadcast('waivecarCounterStateChanged',newStatus,105);
		expect(ctrl.status).toEqual(newStatus);
	});
});