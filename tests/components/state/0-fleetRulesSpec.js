fdescribe('Fleet state rules',function(){
	var flag=null;
	var flags={};
	var $q;
	var mockLocationService={
		getLocation:function(){
			if(flags.location){
				return $q.resolve();
			}
			return $q.reject();
		}
	};
	var mockSelectedService={
		hasCarSelection:function(){
			return flags.selection;
		}
	}

	beforeEach(function(){
		var self=this;
		addPromiseTests(this);
		angular.module('Maps',[]);
		angular.mock.module('WaiveCar.state.rules',function($provide){
			$provide.value('locationService',mockLocationService);
			$provide.value('selectedCar',mockSelectedService);
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
			flags.location = false;
			var p=this.rules.arrive();
			this.testPromiseFailure(p,function(){
				expect(true).toEqual(true);
			});
		});
		it('Allows if we have the location',function(){
			flags.location = ftrue;
			var p=this.rules.arrive();
			this.testPromiseSuccess(p,function(){
				expect(true).toEqual(true);
			});

		});
	});
	fdescribe('Leaving',function(){
		it('Doesn\'t allow  to leave if the car is not selected',function(){
			flags.selection = false;
			expect(this.rules.leave()).toEqual(false);
		});
		it('Allows to leave if the car is selected',function(){
			flags.selection = true;
			expect(this.rules.leave()).toEqual(true);
		});
	});
});