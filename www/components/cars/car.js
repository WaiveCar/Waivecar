/**
* Handles maily functions related to a single car
*/
// Cars - Show
function CarController($state, $q, selectedCar,WaiveCarStateService. DataService) {

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
  var selectedData = selectedCar.getSelected();
  if (angular.isUndefined(selectedData)) $state.go('cars');
}

CarController.prototype.getDestiny = function() {

  return this.selectedCar.getSelected().location;
};

CarController.prototype.chooseCar = function() {
  var self         = this;
  var selectedData = this.selectedCar.getSelected();
  var carId        = selectedData.id;
  this.WaiveCarStateService.next({
    redirectUrl    :'bookings-new',
    redirectParams : {
      carId     : self.DataService.active.cars.id,
      includeAd : true
    }
  });
};

CarController.prototype.cancel = function() {
  this.state.go('cars');
};
function carChargeStatusDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
    var selectedData = selectedCar.getSelected();
    if (!selectedData) {
      return;
    }
    var details = selectedData.status;

    scope.chargeLevel = details.charge.current + '%';
    if (details.charge.charging) {
      scope.chargeState = 'Parked at charging station';
      scope.chargeFull  = details.charge.timeUntilFull + ' minutes';
    } else {
      scope.chargeState = 'Not charging';
    }

    scope.chargeReach = details.charge.reach+' miles ';
  }

  return {
    restrict    : 'E',
    link        : link,
    templateUrl : 'components/cars/templates/directives/carChargeStatus.html'
  }
}

function carInformationDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
      var details = selectedCar.getSelected();
      if (details) {
        scope.make = details.make;
        scope.model = details.model;
        scope.plate = details.plate;
        scope.image = details.image;
      }
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
  'selectedCar',
  carInformationDirective
]);