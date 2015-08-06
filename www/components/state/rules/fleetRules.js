function FleetRulesService(locationService,selectedCarService){
	this.locationService=locationService;
	this.selectedCarService=selectedCarService;
}
FleetRulesService.prototype.getRules = function() {
	var self=this;
	return {
		arrive:function(){
			return self.locationService.getLocation().then(function(){
				return true;
			});
		},
		leave:function(){
			return self.selectedCarService.hasCarSelection();
		}
	}
};
angular.module('WaiveCar.state.rules',['Maps'])
.service('FleetRulesService', [
	'locationService',
	'selectedCar',
  	FleetRulesService
])