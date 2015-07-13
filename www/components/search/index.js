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
  this.selectedService=selectedService;
  var selectedData=selectedService.getSelected();
  this.state=$state;
  if(typeof selectedData=="undefined"){
    $state.go('search');
  }
}
VehicleDetailsController.prototype.bookingClick = function() {
  var selectedData=this.selectedService.getSelected();
  this.state.go('get-to-waivecar',{vehicleDetails:selectedData});

};
VehicleDetailsController.prototype.cancelClick = function() {
    this.state.go('search');
};

VehicleDetailsController.prototype.getDirectionsClick = function() {
    // TODO: use actual address.
    var url= [
      'comgooglemaps-x-callback://?',
      '&daddr=International+Airport',
      '&directionsmode=walking',
      '&x-success=WaiveCar://?resume=true',
      '&x-source=WaiveCar'
    ].join('');
    window.open(encodeURI(url), '_system');
};

function SelectedVehicleService($rootScope){
	this.$rootScope;
}
SelectedVehicleService.prototype.setSelected = function(selected) {
	this.selected=selected;
};
SelectedVehicleService.prototype.getSelected = function() {
	return this.selected;
};


function vehicleChargeStatusDirective(searchEvents,$state){
      function link(scope,element,attrs,ctrl){
        if(!$state.params){
          return;
        }
        var details=$state.params.vehicleDetails.status;
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
        templateUrl:'components/search/templates/vehicleChargeStatus.html',
      }
}

function timeToGetToCarDirective(searchEvents,$state){
  function link(scope,element,attrs,ctrl){

    var durations={'timeToCar':15};
    ctrl.createTimer('getToWaiveCar',durations);
    ctrl.start();
    var watchExpressions=[
      function(){
          return ctrl.seconds;
      },
      function(){
          return ctrl.minutes;
      },
      function(){
          return ctrl.seconds;
      }
    ];
    scope.$watchGroup(watchExpressions, function(newValues, oldValues, scope) {
          if(typeof ctrl.hours !='undefined' && ctrl.hours>0){
            scope.timeLeftDisplay=ctrl.hours+':'+ctrl.minutes+' hours left';
          }
          else if(typeof ctrl.minutes !='undefined' && ctrl.minutes>0){
            scope.timeLeftDisplay=ctrl.minutes+':'+ctrl.seconds+' minutes left';
          }
          else if(typeof ctrl.seconds !='undefined' && ctrl.seconds>0){
            scope.timeLeftDisplay=ctrl.seconds+' seconds left';
          }
          else{
              scope.timeLeftDisplay='no time left';

          }
    });

  }
 return {
      restrict:'E',
      templateUrl:'components/search/templates/timeToGetToCar.html',
      link:link,
      controller:'TimerController',
      controllerAs:'timer'
    }

}
function vehicleInformationDirective(searchEvents,$state){
      function link(scope,element,attrs,ctrl){
        if(!$state.params){
          return;
        }
        var details=$state.params.vehicleDetails;
        scope.name=details.name;
        scope.plate=details.plate;
      }
      return {
        restrict:'E',
        link:link,
        templateUrl:'components/search/templates/vehicleInformation.html',
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
.directive('timeToGetToCar',['searchEvents','$state',timeToGetToCarDirective])
.directive('vehicleChargeStatus',['searchEvents','$state',vehicleChargeStatusDirective])
.directive('vehicleInformation',['searchEvents','$state',vehicleInformationDirective]);