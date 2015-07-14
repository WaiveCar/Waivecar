// Cars - List
function CarsController($rootScope, $scope, $state, selectedCar, Cars, searchEvents, mapsEvents) {
  var self = this;

  this.state = $state;
  this.$rootScope = $rootScope;
  this.$scope = $scope;
  this.selectedCar = selectedCar;
  this.searchEvents = searchEvents;
  this.mapsEvents = mapsEvents;
  // self.cars = Cars.query();
}

CarsController.prototype.showCarDetails = function(marker, data) {
  var self = this;
  var latLng={latitude:data.latitude,longitude:data.longitude};

  this.selectedCar.setSelected(data);
  this.$rootScope.$broadcast(this.mapsEvents.destinyOnRouteChanged,latLng);
  this.$rootScope.$broadcast(this.searchEvents.vehicleSelected,data);
  this.state.go('cars-show',{ id: data.id });
};

// Cars - Show
function CarController($state, selectedCar) {
  this.selectedCar = $state.params.data;
  this.selectedCar=selectedCar;
  var selectedData=selectedCar.getSelected();
  this.state=$state;
  if (angular.isUndefined(selectedData)) $state.go('cars');
}

CarController.prototype.book = function() {
  var selectedData = this.selectedCar.getSelected();
  this.state.go('bookings-new', { vehicleDetails: selectedData });
};

CarController.prototype.cancel = function() {
  this.state.go('cars');
};

angular.module('app')
.controller('CarController', [
  '$state',
  'selectedCar',
  CarController
])
.controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  'selectedCar',
  'Cars',
  'searchEvents',
  'mapsEvents',
  CarsController
]);
