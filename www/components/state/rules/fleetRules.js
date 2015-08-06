function FleetRulesService(locationService){
	this.locationService=locationService;
}
FleetRulesService.prototype.getRules = function() {
	var self=this;
	return {
		arrive:function(){
			return self.locationService.getLocation().then(function(){
				return true;
			});
		}
	}
};
angular.module('WaiveCar.state.rules',['Maps'])
.service('FleetRulesService', [
	'locationService',
  	FleetRulesService
])