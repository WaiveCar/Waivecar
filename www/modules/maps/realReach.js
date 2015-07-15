
(function() {
  function RealReachService($rootScope, MapsLoader, $q, $http, locationService) {
    this.MapsLoader = MapsLoader;
    this._scope = $rootScope;
    this.$q = $q;
    this.$http = $http;
    this.locationService = locationService;
  }
  RealReachService.prototype.getReachInMinutes = function(minutes, transport) {
    var self = this;
    return this.MapsLoader.getMap.then(function(maps) {
      var defered = self.$q.defer();
      self.locationService.getLocation().then(function(location) {
        var url = "http://" + maps.skobbler.apiKey + ".tor.skobbler.net/tor/RSngx/RealReach/json/18_0/en/" + maps.skobbler.apiKey;
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