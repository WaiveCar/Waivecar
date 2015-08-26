function SelectedCarService($rootScope) {
  this.$rootScope;
}

SelectedCarService.prototype.setSelected = function(selected) {
  this.selected = selected;
};

SelectedCarService.prototype.getSelected = function() {
  return this.selected;
};
SelectedCarService.prototype.hasCarSelection = function() {
  return !!this.selected;
};


function FleetRulesService(locationService,selectedCarService){
	this.locationService=locationService;
	this.selectedCarService=selectedCarService;
}
FleetRulesService.prototype.getRules = function() {
	var self=this;
	return {
		arrive:function(){
			console.log("FLEET ARRIVE");
			return self.locationService.getLocation().then(function(){
				return true;
			});
		},
		leave:function(){
			return self.selectedCarService.hasCarSelection();
		}
	}
};
angular.module('WaiveCar.state.fleetRules',['Maps'])
.service('selectedCar', [
  '$rootScope',
  SelectedCarService
])
.service('FleetRulesService', [
	'locationService',
	'selectedCar',
  	FleetRulesService
]);