/**
* Handles maily functions related to a single car
*/
// Cars - Show
function CarController($state, $q, selectedCar,WaiveCarStateService,DataService) {

  var self          = this;
  self.$state        = $state;
  self.$q           = $q;
  self.DataService  = DataService;
  self.UserResource = DataService.resources.users;
  self.car          = DataService.active;
  self.WaiveCarStateService = WaiveCarStateService;

  self.DataService.activate('cars', $state.params.id, function(err, activatedCar) {
    if (err) console.log(err);
    
  });

  this.selectedCar = selectedCar;

}
CarController.prototype.getDestiny = function() {
  return this.selectedCar.getSelected().location;
};
CarController.prototype.chooseCar = function() {
  var self         = this;
  var selectedData = this.selectedCar.getSelected();
  var carId        = selectedData.id;
  console.log("THE CHOSEN CAR");
  console.log(self.DataService.active.cars);
  this.WaiveCarStateService.next(
    {
      id     : self.DataService.active.cars.id,
      includeAd : true
    }
  );
};
CarController.prototype.cancel = function() {
  this.WaiveCarStateService.previous();
};
function carChargeStatusDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
    var selectedData = selectedCar.getSelected();
    if (!selectedData) {
      return;
    }
    var diagnosticsData={}
    selectedData.diagnostics.forEach(function(d){
      diagnosticsData[d.type]=d.value;
    });

    // var details = selectedData.status;

    scope.chargeLevel = diagnosticsData.evBatteryLevel + '%';
    if (diagnosticsData.evChargeState==="Not Charged") {
      scope.chargeState = 'Not charging';
      
    } else {
      scope.chargeState = 'Parked at charging station';
    }
    scope.chargeReach = diagnosticsData.totalRange+' miles ';
  }

  return {
    restrict    : 'E',
    link        : link,
    templateUrl : 'components/cars/templates/directives/carChargeStatus.html'
  }
}

function carInformationDirective(searchEvents, DataService) {
  /**
  *@todo remove mocks
  */
  function link(scope, element, attrs, ctrl) {
      var details = DataService.active.cars;
      scope.$watch(function(){
        return  DataService.active.cars;
      },function(){
        if (details) {
          scope.make = details.make;
          scope.model = details.model || 'Spark';
          scope.plate = details.plate || 'AUD 568';
          scope.image = details.image || '/img/car.jpg';
        }

      })
  }
  return {
    restrict    : 'E',
    link        : link,
    transclude  : true,
    templateUrl : 'components/cars/templates/directives/carInformation.html'
  }
}

angular.module('app')
.constant('searchEvents', {
  vehicleSelected: 'vehicleSelected'
})
.controller('CarController', [
  '$state',
  '$q',
  'selectedCar',
  'WaiveCarStateService',
  'DataService',
  CarController
])
.directive('carChargeStatus', [
  'searchEvents',
  'selectedCar',
  carChargeStatusDirective
])
.directive('carInformation', [
  'searchEvents',
  'DataService',
  carInformationDirective
]);