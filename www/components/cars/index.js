
function SelectedCarService($rootScope) {
  this.$rootScope;
}
SelectedCarService.prototype.setSelected = function(selected) {
  this.selected = selected;
};
SelectedCarService.prototype.getSelected = function() {
  return this.selected;
};



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
  var latLng = {latitude: data.latitude, longitude: data.longitude};

  this.selectedCar.setSelected(data);
  this.$rootScope.$broadcast(this.mapsEvents.destinyOnRouteChanged, latLng);
  this.$rootScope.$broadcast(this.searchEvents.vehicleSelected, data);
  this.state.go('cars-show', { id: data.id});
};

// Cars - Show
function CarController($state, $q, selectedCar) {
  this.selectedCar = selectedCar;
  var selectedData = selectedCar.getSelected();
  this.state = $state;
  this.$q = $q;
  if (angular.isUndefined(selectedData)) $state.go('cars');
}
CarController.prototype.getDestiny = function() {
  return this.selectedCar.getSelected();
};

CarController.prototype.book = function() {
  var selectedData = this.selectedCar.getSelected();
  this.state.go('bookings-new', { vehicleDetails: selectedData });
};

CarController.prototype.cancel = function() {
  this.state.go('cars');
};

function FleetService($rootScope, $q, locationService, $http, config) {
  this.$q = $q;
  this.locationService = locationService;
  this.$http = $http;
  this.$rootScope = $rootScope;
  this.url = config.uri.vehicles.getNearby;
}
FleetService.prototype.getNearbyFleet = function(numNearby) {
  var self = this;
  return this.locationService.getLocation().then(
            function(deviceLocation) { 
              var ret = [];
              numNearby = numNearby || 10;
              var maxDiff = 0.005;
              var idCount = 1;
              var minDiff = 0.0005;
              for (var i = 0; i < numNearby; i++) {
                var diffA = Math.random() * (maxDiff - minDiff) + minDiff;
                var diffB = Math.random() * (maxDiff - minDiff) + minDiff
                if (Math.random() < .5) {
                  diffA = diffA * -1;
                }
                if (Math.random() < .5) {
                  diffB = diffB * -1;
                }
                ret.push(
                        {
                          latitude: deviceLocation.latitude + diffA,
                          longitude: deviceLocation.longitude + diffB,
                          status: {
                            charge: {
                              current: 69,
                              timeUntilFull: 20,
                              reach: 10,
                              charging: true
                            }
                          },
                          id: idCount++
                        }
                    )
              }
              return ret;
              //HOlding until new API is up
              // var defered=self.$q.defer();
              // var config={
              //     timeout:TIMEOUT_REQUEST,
              //     method:"POST",
              //     data:{location:deviceLocation,numNearby:numNearby},
              //     url:self.url
              // }
              // var startTime = new Date().getTime();
              // self.$http(config)
              // .success(function(response, status, headers, config) {
              //     defered.resolve(response.data)
              // })
              // .error(function(response, status, headers, config) {
              //     var respTime = new Date().getTime() - startTime;
              //     if(respTime >= TIMEOUT_REQUEST){
              //         defered.resolve([]);
              //     }
              //     else{
              //         defered.reject({response:response,status:status,headers:headers});
              //     }
              // });
              // return defered.promise;
            }
        );
}
function nearbyFleetDirective(MapsLoader, $q, fleetService, realReachService, $window) {
  function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({marker: marker, info: info});
    });
  }
  
  function link(scope, element, attrs, ctrl) {
    fleetService.getNearbyFleet().then(function(fleet) { 
      MapsLoader.getMap.then(function(L) {
        ctrl.mapInstance.then(function(mapInstance) {

          var waiveCarIcon = L.icon({
            iconUrl: 'img/waivecar-mark.svg',
            iconRetinaUrl: 'img/waivecar-mark.svg',
            iconSize: [25, 25],
            iconAnchor: [12.5, 25],
            popupAnchor: [0 , 0]
          });

          var latLng;
          var markers = [];
          var marker;
          fleet.forEach(function(f) {
            marker = L.marker([f.latitude, f.longitude], {icon: waiveCarIcon}).addTo(mapInstance);
            addMarkerClick(marker, f, scope.onClickMarker);
            markers.push(marker);
          });
          // realReachService.getReachInMinutes(15,TRANSPORT_PEDESTRIAN).then(function(reach){
          //   var numPoints=reach.realReach.gpsPoints.length;
          //   var polygonPoints=[];
          //   var latLng;
          //       //No idea why we have to skip the first 8
          //       for(var i=8; i<numPoints; i+=2){
          //         //No idea why they invert this also
          //         latLng=new L.LatLng(reach.realReach.gpsPoints[i+1], reach.realReach.gpsPoints[i]);
          //         polygonPoints.push(latLng);
          //     }
          //     var polygon = new L.Polygon(polygonPoints);
          //     mapInstance.addLayer(polygon);
          //     scope.reachPolygon=polygon;
          //     marker=L.marker(latLng,{icon:waiveCarIcon}).addTo(mapInstance);
          //     ctrl.solveDestiny(marker);
          //     addMarkerClick(marker);
          // });
        });
      });

    });
  }
  return {
    restrict: 'CE',
    link: link,
    require: '^map',
    scope: {
      onClickMarker: '&'
    }
  }
}
function carChargeStatusDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
    var selectedData = selectedCar.getSelected();
    if (!selectedData) {
      return;
    }
    var details = selectedData.status;
    scope.chargeLevel = details.charge.current + '% full';
    if (details.charge.charging) {
      scope.chargeState = 'Parked at charging station';
      scope.chargeLevel += ' - full in ' + details.charge.timeUntilFull + ' minutes';
    } else {
      scope.chargeState = 'Not charging';
    }

    scope.chargeReach = details.charge.reach + ' miles available on current charge';
  }

  return {
    restrict: 'E',
    link: link,
    templateUrl: 'components/cars/templates/directives/carChargeStatus.html'
  }
}
angular.module('app')
.constant('searchEvents', {
  vehicleSelected: 'vehicleSelected'
})
.service('selectedCar', [
  '$rootScope',
  SelectedCarService
])
.service('fleetService', ['$rootScope', '$q', 'locationService', '$http', 'config', FleetService])
.controller('CarController', [
  '$state',
  '$q',
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
])
.directive('carChargeStatus', [
  'searchEvents',
  'selectedCar',
  carChargeStatusDirective
])
.directive('nearbyFleet', ['MapsLoader', '$q', 'fleetService', 'realReachService', '$window', nearbyFleetDirective]);