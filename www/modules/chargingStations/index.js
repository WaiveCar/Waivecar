function ChargingStationsService($rootScope, $q, locationService, $http) {
  this.$q = $q;
  this.locationService = locationService;
  this.$http = $http;
  this.$rootScope = $rootScope;
}
ChargingStationsService.prototype.getNearbyChargingStations = function(numNearby) {
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
                        }
                    )
              }
              return ret;
            }
        );
}
function nearbyChargingStationsDirective(MapsLoader, $q, chargingStationsService){
	 function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({marker: marker, info: info});
    });
  }
  
  function link(scope, element, attrs, ctrl) {
    chargingStationsService.getNearbyChargingStations().then(function(stations) { 
      MapsLoader.getMap.then(function(L) {
        ctrl.mapInstance.then(function(mapInstance) {
          var icon = L.icon({
            iconUrl: 'img/chargingStation.svg',
            iconRetinaUrl: 'img/chargingStation.svg',
            iconSize: [16, 25],
            iconAnchor: [8, 25],
            popupAnchor: [0 , 0]
          });
          var latLng;
          var markers = [];
          var marker;
          stations.forEach(function(s) {
            marker = L.marker([s.latitude, s.longitude], {icon: icon}).addTo(mapInstance);
            addMarkerClick(marker, s, scope.onClickMarker);
            markers.push(marker);
          });
        
        });
      });

    });
  }
  return {
    restrict: 'E',
    link: link,
    require: '^map',
    scope: {
      onClickMarker: '&'
    }
  }
}
angular.module('ChargingStations', [])
.service('chargingStationsService', ['$rootScope', '$q', 'locationService', '$http', ChargingStationsService])
.directive('nearbyChargingStations', ['MapsLoader', '$q', 'chargingStationsService',nearbyChargingStationsDirective]);
