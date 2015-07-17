(function() {
  var apiKey = '7ef929e2c765b1194804e5e8ca284c5a';
  function MapsLoader() {

    var options;
    return {
      $get: function($q, $window) {
        L.skobbler.apiKey = apiKey;
        var deferred = $q.defer();
        deferred.resolve(L);
        return {
          getMap: deferred.promise
        }
      },
      setOption: function() {
        //TBD
      }
    }
  }
  function LocationService($rootScope, $cordovaGeolocation, $q, mapsEvents,$state) {
    this.$cordovaGeolocation = $cordovaGeolocation;
    this.$q = $q;
    this._scope = $rootScope;
    this.mapsEvents = mapsEvents;
    this.$state=$state;
  }
  LocationService.prototype.init = function() {
    this._initPositionWatch();
  };
  LocationService.prototype._initPositionWatch = function() {
    var self = this;
    var posOptions = {maximumAge: 3000, timeout: 8000, enableHighAccuracy: true};

    var watch = this.$cordovaGeolocation.watchPosition(posOptions);
    watch.then(null, function(err) {}, function(position) {
          var positionEvent = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          self._scope.$broadcast(self.mapsEvents.positionChanged, positionEvent);
        });
  };
  LocationService.prototype.getLocation = function() {
    var posOptions = {maximumAge: 3000, timeout: 8000, enableHighAccuracy: true};
    var defered = this.$q.defer();
    var self = this;
    if(typeof this._pendingRequest !='undefined' && this._pendingRequest){
      return this._pendingRequest;
    }
    this.$cordovaGeolocation
      .getCurrentPosition(posOptions)
          .then(function(position) {
            defered.resolve(
              {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }
            );
            self._pendingRequest=null;
          },
      function(err) {
        defered.reject(err);
        self.$state.go('location-error');
        self._pendingRequest=null;
      }
    );
    this._pendingRequest=defered.promise;
    return this._pendingRequest
  };

  function MapController($scope, locationService, $q, mapsEvents) {
    this._deferedMap = $q.defer();
    this.mapInstance = this._deferedMap.promise;

    this._deferedLocation = $q.defer();
    this.locationMarker = this._deferedLocation.promise;
    this._locationMarker;

    this._deferedDestiny = $q.defer();
    this.destinyMarker = this._deferedDestiny.promise;
    var self = this;
    $scope.$on(mapsEvents.positionChanged, function(ev, position) {
      if (typeof self._locationMarker != 'undefined' && !!self._locationMarker) {
        self._locationMarker.setLatLng([position.latitude, position.longitude]);
      }
    });
  }
  MapController.prototype.updateTileCount = function(tileCount) {
    this._scope.tileCount = tileCount;
  };
  MapController.prototype.solveMap = function(mapInstance) {
    this._deferedMap.resolve(mapInstance);
  };
  MapController.prototype.solveDestiny = function(destinyMarker) {
      this._deferedDestiny.resolve(destinyMarker);
    };
  MapController.prototype.solveLocation = function(locationMarker) {
    this._locationMarker = locationMarker;
    this._deferedLocation.resolve(locationMarker);
  };
  function mapDirective(MapsLoader, $q, locationService) {
        function link(scope, element, attrs, ctrl) {
          var location;
          MapsLoader.getMap.then(function(maps) {

            locationService.getLocation().then(function(deviceLocation) {
              location=deviceLocation;
              var mapOptions = {
                center: [deviceLocation.latitude, deviceLocation.longitude],
                apiKey: maps.skobbler.apiKey,
                zoom: parseInt(scope.zoom, 10),
                tap: true,
                trackResize: false
              }
              var mapInstance = maps.skobbler.map(element[0].firstChild, mapOptions);
              ctrl.solveMap(mapInstance);
            })
          });
        }
        return {
          restrict: 'CE',
          scope: {
              zoom: '@'
            },
          templateUrl: 'modules/maps/templates/map.html',
          link: link,
          transclude: true,
          controllerAs: 'mapController',
          controller: 'mapController'
        };
      }
      
  function deviceLocationDirective(MapsLoader, locationService, $q) {
        function link(scope, element, attrs, ctrl) {
          MapsLoader.getMap.then(function(L) {
              locationService.getLocation().then(function(deviceLocation) {

                ctrl.mapInstance.then(function(mapInstance) {
                  var icon = L.MakiMarkers.icon({icon: "pitch", size: "m"});
                  var marker = L.marker([deviceLocation.latitude, deviceLocation.longitude], {draggable: true, icon: icon}).addTo(mapInstance);
                  ctrl.solveLocation(marker);
                });
              });
            });
        }
        return {
          restrict: 'E',
          require: '^map',
          link: link
        }
      }
  angular.module('Maps', ['ngCordova'])
     .constant('mapsEvents', {
       'routeDurationChanged': 'waiveCarRouteDurationChanged',
       'routeDistanceChanged': 'waiveCarRouteDistanceChanged',
       'positionChanged': 'waiveCarPositionChanged',
       'destinyOnRouteChanged': 'waiveCarDestinyOnRouteChanged'

     })
    .constant('transports', {
      pedestrian: 'pedestrian',
      car: 'car' 
    })
    .provider('MapsLoader', MapsLoader)
    .service('locationService', ['$rootScope', '$cordovaGeolocation', '$q', 'mapsEvents','$state', LocationService])
    .controller('mapController', ['$scope', 'locationService', '$q', 'mapsEvents', MapController])
    .directive('map', ['MapsLoader', '$q', 'locationService', mapDirective])
    .directive('deviceLocation', ['MapsLoader', 'locationService', '$q', deviceLocationDirective]);
})();

// controller:['$scope','locationService','$q',MapController]