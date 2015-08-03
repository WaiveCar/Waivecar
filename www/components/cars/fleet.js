/**
* Responsible for everything related to a cluster of cars
*/

function SelectedCarService($rootScope) {
  this.$rootScope;
}

SelectedCarService.prototype.setSelected = function(selected) {
  this.selected = selected;
};

SelectedCarService.prototype.getSelected = function() {
  return this.selected;
};

function FleetService($rootScope, $q, locationService) {
  this.$q = $q;
  this.locationService = locationService;
  this.$rootScope = $rootScope;
}

FleetService.prototype.getNearbyFleet = function(location,cars) {
  var self = this;
    var ret = [];
    var idCount = 1;
    var ret=[];
    _.each(cars, function(car) {
      var loc = self.getRandomLocationInRange(location);
      car.latitude  = car.location.latitude;
      car.longitude = car.location.longitude;
      car.image     = '/components/ads/templates/images/ad1.png';
      car.plate     = 'AUD 568';
      car.name      = 'Chevrolet Spark',
      car.status    = {
        charge: {
          current: 69,
          timeUntilFull: 20,
          reach: 10,
          charging: true
        }
      };
      ret.push(car);
    });
    return ret;
}
FleetService.prototype.getRandomLocationInRange = function(location) {
  var maxDiff = 0.005;
  var minDiff = 0.0005;
  var diffA = Math.random() * (maxDiff - minDiff) + minDiff;
    var diffB = Math.random() * (maxDiff - minDiff) + minDiff
    if (Math.random() < .5) {
      diffA = diffA * -1;
    }
    if (Math.random() < .5) {
      diffB = diffB * -1;
    }
    return {
      latitude: location.latitude + diffA,
      longitude: location.longitude + diffB
    };
};

function nearbyFleetDirective(MapsLoader, $q, fleetService, realReachService, locationService) {

  function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({ marker: marker, info: info });
    });
  }

  function link(scope, element, attrs, ctrl) {
    MapsLoader.getMap.then(function(L) {
      self.L = L;
      console.log('maps');
      return ctrl.mapInstance;
    })
    .then(function(mapInstance){
      self.mapInstance = mapInstance;
      console.log('mapInstance');
      return locationService.getLocation();
    })
    .then(function(deviceLocation){
      console.log('Location');
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
          var str='';
          scope.cars.forEach(function(c){
            str+=c.id+c.location.latitude+c.location.longitude;
          });
          return str;
      }, function() {
        var cars=scope.cars;
        if (!waiveCarIcon || !cars || cars.length === 0) {
          return;
        }

        console.log('car watch ' + cars.length);

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

function FleetController($rootScope, $scope, $state, selectedCar, searchEvents, mapsEvents, DataService,mockLocation) {
  var self          = this;
  this.$state       = $state;
  this.$rootScope   = $rootScope;
  this.$scope       = $scope;
  this.all          = DataService.all;
  this.active       = DataService.active;
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
  this.$state.go('cars-show', { id: data.id });
};

FleetController.prototype.locateMe = function() {
  this.mockLocation.mockLocation();
};

angular.module('app')
.service('fleetService', [
  '$rootScope',
  '$q',
  'locationService',
  FleetService
])
.directive('nearbyFleet', [
  'MapsLoader',
  '$q',
  'fleetService',
  'realReachService',
  'locationService',
  nearbyFleetDirective
])
.service('selectedCar', [
  '$rootScope',
  SelectedCarService
])
.controller('FleetController', [
  '$rootScope',
  '$scope',
  '$state',
  'selectedCar',
  'searchEvents',
  'mapsEvents',
  'DataService',
  'mockCityLocationService',
  FleetController
])