function CarInfoRulesService(DataService,CarAvailabilityService,$q){
	this.DataService=DataService;
	this.CarAvailabilityService=CarAvailabilityService;
	this.$q=$q;

}
CarInfoRulesService.prototype.getRules = function() {
	var self=this;
	return {
		arrive:function(){

			var carId =10;//self.DataService.active.cars.id;
			return self.CarAvailabilityService.isCarAvailable(carId)
				.then(function(isCarAvailable){
					if(isCarAvailable){
						return true;
					}
					return {params:{id:carId},name:'cars/notAvailable'}
				})
		},
		leave:function(){
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
