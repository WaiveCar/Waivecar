function CarInfoRulesService(DataService,CarAvailabilityService,$q){
	this.DataService=DataService;
	this.CarAvailabilityService=CarAvailabilityService;
	this.$q=$q;

}
CarInfoRulesService.prototype.getRules = function() {
	var self=this;
	return {
		arrive:function(params){
			var carId =self.DataService.active.cars.id || params.id;
			return self.CarAvailabilityService.isCarAvailable(carId)
				.then(function(isCarAvailable){
					if(isCarAvailable){
						return true;
					}
					return {params:{id:carId},name:'cars/notAvailable'}
				})
		}
	}
};
angular.module('WaiveCar.state.carInfoRules',[])
.service('CarInfoRulesService', [
	'DataService',
	'CarAvailabilityService',
	'$q',
  	CarInfoRulesService
]);
