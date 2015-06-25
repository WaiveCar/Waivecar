
describe('Counter Service',function(){
	var service
	var timeout;
	var scope;
	beforeEach(function(){
		angular.mock.module('app.modules.countdown.service');
		angular.mock.inject(function($rootScope,$timeout,$injector,timerService){
			scope  = $rootScope;
			timeout=$timeout;
			service = timerService;
		});
	});
	describe('Timer events',function(){
		it('When the counter starts',function(){
			spyOn(scope, '$broadcast');
			service.start();
			expect(scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStarted','freeRide',105);
			expect(scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateChanged','freeRide',105);
		});
		it('When the freeRide ends ',function(){
			spyOn(scope, '$broadcast');
			service.start();
			timeout.flush(60*60000+45*60000+200);
			expect(scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateFinnished','freeRide',105);
		})
		it('When the free ride alert starts',function(){
			spyOn(scope, '$broadcast');
			service.start();
			timeout.flush(60*60000+45*60000+200);
			expect(scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateChanged','freeRideAlert',15);

		});
		it('When the freeRide alerts ends ',function(){
			spyOn(scope, '$broadcast');
			service.start();
			timeout.flush(60*60000+45*60000);
			timeout.flush(15*60000+200);
			expect(scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateFinnished','freeRideAlert',15);
		})
		it('When the free ride  finishes',function(){
			spyOn(scope, '$broadcast');
			service.start();
			timeout.flush(60*60000+45*60000);
			timeout.flush(15*60000+200);

			expect(scope.$broadcast).toHaveBeenCalledWith('waivecarCounterStateChanged','paidRide',-1);
		});
		it('When gets cancelled',function(){
			spyOn(scope, '$broadcast');
			service.start();
			timeout.flush(15*60*1000);
			service.cancel();
			var lastArgs=scope.$broadcast.calls.mostRecent().args;
			expect(lastArgs[0]).toEqual('waivecarCounterCancelled');
			expect(lastArgs[1]).toEqual('freeRide');
			expect(lastArgs[2]).toEqual(105);

		});
		
		/*it('Communicates when a counter is about to end it\'s time limit',function(done){
		});
		it('Communicates when a counter reach it\'s time limit',function(done){
		});*/
	});
	
});