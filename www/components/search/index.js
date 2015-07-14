function SelectedCarService($rootScope){
	this.$rootScope;
}
SelectedCarService.prototype.setSelected = function(selected) {
	this.selected=selected;
};
SelectedCarService.prototype.getSelected = function() {
	return this.selected;
};

angular.module('app')
.constant('searchEvents', {
  vehicleSelected:'vehicleSelected'
})
.service('selectedCar',[
  '$rootScope',
  SelectedCarService
])
