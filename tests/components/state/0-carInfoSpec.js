fdescribe('Car info state rules',function(){
	var flags={};
	var $q;
	var mockDataService={
		active:{
			cars:{
				id:10
			}
		}
	}
	var mockCarAvailabilityService={
		isCarAvailable:function(carId){
			return $q.when(!!flags.carAvailable);
		}
	};
	beforeEach(function(){
		var self=this;
		addPromiseTests(this);
		angular.module('Maps',[]);
		angular.mock.module('WaiveCar.state.carInfoRules',function($provide){
			$provide.value('DataService',mockDataService);
			$provide.value('CarAvailabilityService',mockCarAvailabilityService);

		});
		angular.mock.inject(function($rootScope,CarInfoRulesService,_$q_){
			self.service=CarInfoRulesService;
			self.rules = this.service.getRules();
			this.$rootScope=$rootScope;
			$q = _$q_;
		});
	});


	describe('Arrival',function(){
		it('Shows if the car is available',function(){
			flags.carAvailable =true;
			var p=this.rules.arrive();
			this.testPromiseSuccess(p,function(result){
				expect(result).toEqual(true);
			});
		});
		it('Do not show if the car is not available',function(){
			flags.carAvailable =false;
			var p=this.rules.arrive();
			this.testPromiseSuccess(p,function(result){
				expect(result).toEqual(
					{
						params:{
							id:mockDataService.active.cars.id
						},
						name:'cars/notAvailable'
					}
				);
			});
		});
	});
	describe('Leaving',function(){
		it('If the user is not logged he goes to signIn/signUp');
		it('If the user is logged it goes to booking');
	});
});
