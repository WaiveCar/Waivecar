describe('Countdown Timer',function(){
	var name="timer";
	var durations={
		'freeRide':105,
		'freeRideAlert':15,
		'paidRide':-1
	}
	var statusOrders=Object.keys(durations);
	var firstStatus=statusOrders[0];
	var firstStatusDuration=durations[statusOrders[0]];
	
	var newCounterEvent;
	var counterCancelledEvent;
	var counterStateChangedEvent;
	var counterStateFinishedEvent;
	
	beforeEach(function(){
		var self=this;
		angular.mock.module('countdown');
		angular.mock.inject(function($rootScope,$timeout,$injector){
			self.scope  = $rootScope.$new();
			self.timeout=$timeout;
			self.countdownEvents=$injector.get('countdownEvents');

			spyOn(this.scope, '$broadcast');

			var CountdownTimer=$injector.get('CountdownTimer');
			self.countdownTimer=new CountdownTimer(name,durations,self.scope);
			
			newCounterEvent=this.countdownEvents.newCounter+'_'+name;
			counterCancelledEvent=this.countdownEvents.counterCancelled+'_'+name;
			counterStateChangedEvent=this.countdownEvents.counterStateChanged+'_'+name;
			counterStateFinishedEvent=this.countdownEvents.counterStateFinished+'_'+name;

		});
	});
	describe('Behaviour',function(){
		it('When a state ends the next one starts',function(){
			this.countdownTimer.start();
			this.timeout.flush(firstStatusDuration*60000+10);
			expect(this.countdownTimer.getStatus(name)).toEqual(statusOrders[1]);
		});

	});
	describe('Timer events',function(){
		it('When the counter starts it sends a new counter event and a counter state changed event',function(){
			this.countdownTimer.start();
	
			expect(this.scope.$broadcast).toHaveBeenCalledWith(newCounterEvent,firstStatus,firstStatusDuration);
			expect(this.scope.$broadcast).toHaveBeenCalledWith(counterStateChangedEvent,firstStatus,firstStatusDuration);
		});
		it('When a states finish it sends an state finished event ',function(){
			this.countdownTimer.start();
			
			this.timeout.flush(firstStatusDuration*60000+10);
			expect(this.scope.$broadcast).toHaveBeenCalledWith(counterStateFinishedEvent,firstStatus,firstStatusDuration);
		})
		it('When it gets cancelled it sends an state cancelled event',function(){
			this.countdownTimer.start();
			this.countdownTimer.cancel();

			var lastArgs=this.scope.$broadcast.calls.mostRecent().args;
			expect(lastArgs[0]).toEqual(counterCancelledEvent);
			expect(lastArgs[1]).toEqual(firstStatus);
			expect(lastArgs[2]).toEqual(firstStatusDuration);

		});
		it('When a state finishes the state changed event is sent',function(){
			this.countdownTimer.start();
			this.scope.$broadcast.calls.reset();
			this.timeout.flush(firstStatusDuration*60000+10);
			expect(this.scope.$broadcast).toHaveBeenCalledWith(counterStateChangedEvent,statusOrders[1],durations[statusOrders[1]]);


		})
	});
	
});