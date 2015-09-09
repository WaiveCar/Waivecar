
(function() {
  function RealReachService($rootScope, MapsLoader, $q, $http, locationService) {
    this.MapsLoader = MapsLoader;
    this._scope = $rootScope;
    this.$q = $q;
    this.$http = $http;
    this.locationService = locationService;
  }
  RealReachService.prototype.getUrl = function(apiKey) {
    if (window.cordova) {
      var url = 'http://' + apiKey + '.tor.skobbler.net/tor/RSngx/RealReach/json/18_0/en/' +apiKey;
      return url;
    } else {
      return 'http://localhost:8100/skoblerRealReach';
    }
  };
  RealReachService.prototype.getReachInMinutes = function(minutes, transport) {
    var self = this;
    return this.MapsLoader.getMap.then(function(maps) {
      var defered = self.$q.defer();
      self.locationService.getLocation().then(function(location) {
        var url = self.getUrl(maps.skobbler.apiKey);
        url += '?response_type=gps';
        url += '&units=sec';
        url += '&nonReachable=0';
        url += '&range=' + (minutes * 60);
        url += '&transport=' + transport;
        url += '&start=' + location.latitude + ',' + location.longitude;

        self.$http.get(url)
		    .success(function(data, status, headers, config) {
          defered.resolve(data);
		    })
		    .error(function(data, status, headers, config) {
          defered.reject({data: data, status: status, header: headers, config: config});
		    });

      });
      return defered.promise;
    });
  };
  angular.module('Maps.realReach', ['Maps'])
      .service('realReachService', ['$rootScope', 'MapsLoader', '$q', '$http', 'locationService', RealReachService])
})();

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