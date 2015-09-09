function PointsOfInterestService($rootScope, $q, locationService, $http) {
  this.$q = $q;
  this.locationService = locationService;
  this.$http = $http;
  this.$rootScope = $rootScope;
}
PointsOfInterestService.prototype.getPointsOfInterstNearby = function(numNearby) {
  var self = this;
  return this.locationService.getLocation().then(
            function(deviceLocation) { 
              var ret = [];
              numNearby = numNearby || 2;
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
                          longitude: deviceLocation.longitude + diffB
                        }
                    )
              }
              return ret;
            }
        );
}
function pointsOfInterestNearbyDirective(MapsLoader, $q, pointsOfInterestService){
	 function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({marker: marker, info: info});
    });
  }
  
  function link(scope, element, attrs, ctrl) {
    pointsOfInterestService.getPointsOfInterstNearby().then(function(points) { 
      MapsLoader.getMap.then(function(L) {
        ctrl.mapInstance.then(function(mapInstance) {
          var icon = L.icon({
            iconUrl: 'img/businessPartner.svg',
            iconRetinaUrl: 'img/businessPartner.svg',
            iconSize: [25, 19],
            iconAnchor: [12.5, 19],
            popupAnchor: [0 , 0]
          });
          var latLng;
          var markers = [];
          var marker;
          points.forEach(function(p) {
            marker = L.marker([p.latitude, p.longitude], {icon: icon}).addTo(mapInstance);
            addMarkerClick(marker, p, scope.onClickMarker);
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
angular.module('PointsOfInterest', [])
.service('pointsOfInterestService', ['$rootScope', '$q', 'locationService', '$http', PointsOfInterestService])
.directive('pointsOfInterestNearby', ['MapsLoader', '$q', 'pointsOfInterestService',pointsOfInterestNearbyDirective]);
