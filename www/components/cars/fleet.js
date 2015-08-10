/**
* Responsible for everything related to a cluster of cars
*/


function nearbyFleetDirective(MapsLoader, $q, locationService) {

  function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({ marker: marker, info: info });
    });
  }

  function link(scope, element, attrs, ctrl) {
    MapsLoader.getMap.then(function(L) {
      self.L = L;
      return ctrl.mapInstance;
    })
    .then(function(mapInstance){
      self.mapInstance = mapInstance;
      return locationService.getLocation();
    })
    .then(function(deviceLocation){
      self.deviceLocation = deviceLocation;
    })
    .then(function(){
       var waiveCarIcon = self.L.icon({
        iconUrl       : 'img/active-waivecar.svg',
        iconRetinaUrl : 'img/active-waivecar.svg',
        iconSize      : [20, 25],
        iconAnchor    : [10, 25],
        popupAnchor   : [0 , 0]
      });

      scope.$watch(function(){
          var str = '';
          scope.cars.forEach(function(c){
            str += c.id + c.location.latitude + c.location.longitude;
          });
          return str;
      }, function() {
        var cars=scope.cars;
        if (!waiveCarIcon || !cars || cars.length === 0) {
          return;
        }


        if (scope.group) {
          self.mapInstance.removeLayer(scope.group);
          scope.markers.forEach(function(marker){
            self.mapInstance.removeLayer(marker);
          });
        }

        var markers = [];
        cars.forEach(function(f) {
          var marker = L.marker([ f.location.latitude, f.location.longitude ], { icon: waiveCarIcon }).addTo(self.mapInstance);
          addMarkerClick(marker, f, scope.onClickMarker);
          markers.push(marker);
        });

        if (markers.length>0) {
          var group = new L.featureGroup(markers);
          // self.mapInstance.fitBounds(group.getBounds().pad(0.5))
          scope.group   = group;
          scope.markers = markers;
        }
      }, true);
    })
  }
  return {
    restrict: 'E',
    link: link,
    require: '^map',
    scope: {
      cars: '=',
      onClickMarker: '&'
    }
  }
}

function FleetController($rootScope, $scope, stateService, selectedCar, searchEvents, mapsEvents, mockLocation) {
  var self          = this;
  this.stateService       = stateService;
  this.$rootScope   = $rootScope;
  this.$scope       = $scope;
  this.selectedCar  = selectedCar;
  this.searchEvents = searchEvents;
  this.mapsEvents   = mapsEvents;
  this.mockLocation = mockLocation;
}

FleetController.prototype.showCarDetails = function(marker, data) {
  var self = this;
  var latLng = {latitude: data.latitude, longitude: data.longitude};
  this.selectedCar.setSelected(data);
  this.$rootScope.$broadcast(this.mapsEvents.destinyOnRouteChanged, latLng);
  this.$rootScope.$broadcast(this.searchEvents.vehicleSelected, data);
  console.log("ON SHOW CAR DETAILS!");
  this.stateService.go('cars-show',{ id: data.id });
};

angular.module('app')
.directive('nearbyFleet', [
  'MapsLoader',
  '$q',
  'locationService',
  nearbyFleetDirective
])
.controller('FleetController', [
  '$rootScope',
  '$scope',
  'WaiveCarStateService',
  'selectedCar',
  'searchEvents',
  'mapsEvents',
  'mockCityLocationService',
  FleetController
]);