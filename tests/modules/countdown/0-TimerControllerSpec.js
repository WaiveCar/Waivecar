describe('Countdown timer controller',function(){
	beforeEach(function(){
		var self=this;

		this.mockTimerService={
			getRemainingTime:function(){
				return {
					hours:0,
					minutes:15,
					seconds:0
				};
			},
			getStatus:function(){
				return 'freeRide';
			},
			start:jasmine.createSpy('start'),
			cancel:jasmine.createSpy('cancel'),
			createTimer:jasmine.createSpy('createTimer')
		};
		angular.mock.module('countdown');
		angular.mock.inject(function($rootScope, $controller,$interval,$injector){
			self.$interval=$interval;
			self.countdownEvents=$injector.get('countdownEvents');
			self.scope = $rootScope.$new();
			self.rootScope=$rootScope;
			self.ctrl=$controller('TimerController', {$scope: this.scope,$interval:this.$interval,TimerService:this.mockTimerService});
		});
	});
	it('Creates a new timer and start listening for the relevant events',function(){
		var name='getToCar';
		var durations={'getToCar':15}
		spyOn(this.scope,'$on').and.callThrough();

		this.ctrl.createTimer(name,durations);
		expect(this.mockTimerService.createTimer).toHaveBeenCalledWith(name,durations,this.scope);
		var args=this.scope.$on.calls.allArgs();
		var desiredCalls=[
			this.countdownEvents.newCounter+'_'+name,
			this.countdownEvents.counterStateChanged+'_'+name,
			this.countdownEvents.counterCancelled+'_'+name
		];
		var self=this;
		var actualCalls=[];
		args.forEach(function(c){
			actualCalls.push(c[0]);
		});
		expect(actualCalls).toEqual(desiredCalls);


	});
	describe('On usage',function(){
		var eventName='getToCar';
		var eventDurations={'getToCar':15};
		beforeEach(function(){
			this.ctrl.createTimer(eventName,eventDurations);
		})
		it('Starts a timer upon start event',function(){
			spyOn(this.ctrl, 'startCount').and.callThrough();
			this.ctrl.start();
			expect(this.mockTimerService.start).toHaveBeenCalled();
			this.scope.$broadcast(this.countdownEvents.newCounter+'_'+eventName);
			expect(this.ctrl.startCount).toHaveBeenCalled();
		});
		it('Countdown the time',function(){
			this.ctrl.start();
			this.scope.$broadcast(this.countdownEvents.newCounter+'_'+eventName);
			expect(this.ctrl.minutes).toEqual(15);
			this.$interval.flush(1000);
			expect(this.ctrl.minutes).toEqual(14);
			expect(this.ctrl.seconds).toEqual(59);
		});
		it('Stops counting when cancel is reached',function(){
			spyOn(this.ctrl,'stopCount').and.callThrough();
			this.ctrl.start();
			this.$interval.flush(1200);
			this.ctrl.cancel();
			expect(this.mockTimerService.cancel).toHaveBeenCalled();
			this.scope.$broadcast(this.countdownEvents.counterCancelled+'_'+eventName);
			expect(this.ctrl.stopCount).toHaveBeenCalled();
			expect(this.ctrl._stopInterval).not.toBeDefined();
		});
		it('Changes status ',function(){
			var newStatus='foo';
			this.ctrl.start();
			this.rootScope.$broadcast('waivecarCounterStateChanged'+'_'+eventName,newStatus,105);
			expect(this.ctrl.status).toEqual(newStatus);
		});
	});
});