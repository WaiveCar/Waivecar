describe('Fleet state rules',function(){
	var flag=null;
	var $q;
	var mockLocationService={
		getLocation:function(){
			if(flag){
				return $q.resolve();
			}
			return $q.reject();
		}
	};
	beforeEach(function(){
		var self=this;
		angular.module('Maps',[]);
		angular.mock.module('WaiveCar.state.rules',function($provide){
			$provide.value('locationService',mockLocationService);
		});
		angular.mock.inject(function($rootScope,FleetRulesService,_$q_){
			self.service=FleetRulesService;
			self.rules = this.service.getRules();
			this.$rootScope=$rootScope;
			$q = _$q_;
		});
	});
	describe('Arrival',function(){
		it('Doesn\'t allow if we don\'t have the location',function(){
			flag = false;
			this.rules.arrive().then(function(){
				fail();
			})
			.catch(function(){
				expect(true).toEqual(true);
			});
			this.$rootScope.$digest();
		});
		it('Allows if we have the location',function(){
			flag = true;
			this.rules.arrive().then(function(){
				expect(true).toEqual(true);
			})
			.catch(function(){
				fail();
			});
			this.$rootScope.$digest();
		});
	});
	describe('Leaving',function(){
		it('Dosn\'t allow us to leave if the car is not selected',function(){

		});
	});
});