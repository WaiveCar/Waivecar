fdescribe('Countdown Timer',function(){
	var name="timer";
	var durations={
		'freeRide':105,
		'freeRideAlert':15,
		'paidRide':-1
	}
	var statusOrders=Object.keys(durations);
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
		});
	});
	describe('Timer events',function(){
		fit('When the counter starts it sends a new counter event and a counter state changed event',function(){
			this.countdownTimer.start();
			var firstStatus=statusOrders[0];
			var firstStatusDuration=durations[statusOrders[0]];
			expect(this.scope.$broadcast).toHaveBeenCalledWith(this.countdownEvents.newCounter+'_'+name,firstStatus,firstStatusDuration);
			expect(this.scope.$broadcast).toHaveBeenCalledWith(this.countdownEvents.counterStateChanged+'_'+name,firstStatus,firstStatusDuration);
		});
		it('When the freeRide ends ',function(){
			spyOn(this.scope, '$broadcast');
			this.service.start();
			this.timeout.flush(60*60000+45*60000+200);
			expect(this.scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateFinnished','freeRide',105);
		})
		it('When the free ride alert starts',function(){
			spyOn(this.scope, '$broadcast');
			this.service.start();
			this.timeout.flush(60*60000+45*60000+200);
			expect(this.scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateChanged','freeRideAlert',15);

		});
		it('When the freeRide alerts ends ',function(){
			spyOn(this.scope, '$broadcast');
			this.service.start();
			this.timeout.flush(60*60000+45*60000);
			this.timeout.flush(15*60000+200);
			expect(this.scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateFinnished','freeRideAlert',15);
		})
		it('When the free ride  finishes',function(){
			spyOn(this.scope, '$broadcast');
			this.service.start();
			this.timeout.flush(60*60000+45*60000);
			this.timeout.flush(15*60000+200);

			expect(this.scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateChanged','paidRide',-1);
		});
		it('When gets cancelled',function(){
			spyOn(this.scope, '$broadcast');
			this.service.start();
			this.timeout.flush(15*60*1000);
			this.service.cancel();
			var lastArgs=this.scope.$broadcast.calls.mostRecent().args;
			expect(lastArgs[0]).toEqual('waivecarCounterCancelled');
			expect(lastArgs[1]).toEqual('freeRide');
			expect(lastArgs[2]).toEqual(105);

		});
	});
	
});