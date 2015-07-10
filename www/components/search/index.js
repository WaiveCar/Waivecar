function SearchController($rootScope, $scope,$state,selectedService,Vehicles,searchEvents,mapsEvents) {
  var self = this;
  this.state=$state;
  this.$rootScope=$rootScope;
  this.$scope=$scope;
  this.selectedService=selectedService;
  this.searchEvents=searchEvents;
  this.mapsEvents=mapsEvents;
  // self.vehicles = Vehicles.query();
}
SearchController.prototype.showCarDetails = function(marker,data) {
	this.selectedService.setSelected(data);
  var self=this;
  var latLng={latitude:data.latitude,longitude:data.longitude};
  this.$rootScope.$broadcast(this.mapsEvents.destinyOnRouteChanged,latLng);
  this.$rootScope.$broadcast(this.searchEvents.vehicleSelected,data);    
	this.state.go('vehicle-details',{vehicleDetails:data});
	
};
function VehicleDetailsController(selectedService,$state){
  var selectedData=selectedService.getSelected();
  if(typeof selectedData=="undefined"){
    $state.go('search');
  }
}

function SelectedVehicleService($rootScope){
	this.$rootScope;
}
SelectedVehicleService.prototype.setSelected = function(selected) {
	this.selected=selected;
};
SelectedVehicleService.prototype.getSelected = function() {
	return this.selected;
};


function vehicleSummaryDirective(searchEvents,$state){
      function link(scope,element,attrs,ctrl){
        var details=$state.params.vehicleDetails.status;
        console.log("SUMMARRY");
        console.log(JSON.stringify(details));
        scope.chargeLevel=details.charge.current+"% full";
        if(details.charge.charging){
            scope.chargeState="Parked at charging station";
            scope.chargeLevel+=" - full in "+details.charge.timeUntilFull+" minutes";
        }
        else{
          scope.chargeState="Not charging";
        }
        scope.chargeReach=details.charge.reach+" miles available on current charge";

      }
      return {
        restrict:'E',
        link:link,
        templateUrl:'components/search/templates/vehicleSummary.html',
      }
}

angular.module('app')
.constant('searchEvents',{
    vehicleSelected:'vehicleSelected',
})

.service('selectedVehicleService',['$rootScope',SelectedVehicleService])


.controller('VehicleDetailsController', ['selectedVehicleService','$state',VehicleDetailsController])

.controller('SearchController', [
  '$rootScope',
  '$scope',
  '$state',
  'selectedVehicleService',
  'Vehicles',
  'searchEvents',
  'mapsEvents',
  SearchController
])
.directive('vehicleSummary',['searchEvents','$state',vehicleSummaryDirective]);