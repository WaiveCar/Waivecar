describe('Countdown timer controller',function(){

	beforeEach(function(){
		var self=this;
		this.mockTimerService={
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
				self.rootScope.$broadcast('waivecarCounterStarted','freeRide',105);
			},
			cancel:function(){
				self.rootScope.$broadcast('waivecarCounterCancelled','freeRide',105);
			}
		};
		angular.mock.module('app.modules.countdown.service');
		angular.mock.module('app.modules.countdown.controller');
		angular.mock.inject(function($rootScope, $controller,_$interval_){
			self.$interval=_$interval_;
			//create an empty scope
			self.scope = $rootScope.$new();
			self.rootScope=$rootScope;
			self.ctrl=$controller('timerController', {$scope: this.scope,$interval:this.$interval,timerService:this.mockTimerService});
		});
	});
	it('Starts a timer on count',function(){
		spyOn(this.mockTimerService, 'start').and.callThrough();
		this.ctrl.start();
		expect(this.mockTimerService.start).toHaveBeenCalled();
		this.$interval.flush(1200);
		expect(this.ctrl.minutes).toEqual(0);
		expect(this.ctrl.seconds).toEqual(1);
	});
	it('Stops counting when cancel is reached',function(){
		spyOn(this.mockTimerService,'cancel').and.callThrough();
		this.ctrl.start();
		this.$interval.flush(1200);
		this.ctrl.cancel();
		//_stopInterval
		expect(this.mockTimerService.cancel).toHaveBeenCalled();
		expect(this.ctrl._stopInterval).not.toBeDefined();
	});
	it('Changes status ',function(){
		var newStatus='foo';
		this.rootScope.$broadcast('waivecarCounterStateChanged',newStatus,105);
		expect(this.ctrl.status).toEqual(newStatus);
	});
});