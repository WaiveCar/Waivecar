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
  LocationService.prototype.setManualPosition = function(latitude,longitude) {
    this.manualPosition= {
      latitude: latitude,
      longitude: longitude
    };
    this._scope.$broadcast(this.mapsEvents.positionChanged,this.manualPosition);

  };
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
    if(typeof this.manualPosition !='undefined' && !!this.manualPosition){
      return this.manualPosition;
    }
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
  function mapDirective(MapsLoader, $q, locationService,mapsEvents) {
        function link(scope, element, attrs, ctrl) {
          var location;
          MapsLoader.getMap.then(function(maps) {

            locationService.getLocation().then(function(deviceLocation) {
              location=deviceLocation;
              var centerPosition = [deviceLocation.latitude, deviceLocation.longitude];
              
              var mapOptions = {
                center: centerPosition,
                apiKey: maps.skobbler.apiKey,
                zoom: parseInt(scope.zoom, 10),
                tap: true,
                trackResize: false
              }
              var mapInstance = maps.skobbler.map(element[0].firstChild, mapOptions);
              mapInstance.panTo(centerPosition);
              ctrl.solveMap(mapInstance);
              scope.$on(mapsEvents.positionChanged, function(ev, position) {
                mapInstance.panTo([position.latitude, position.longitude]);
              });
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
  function locateMeDirective(MapsLoader){
      var self=this;
       function link(scope, element, attrs, ctrl) {
        
          MapsLoader.getMap.then(function(L) {
            self.L=L;
            return   ctrl.mapInstance;
          })
          .then(function(mapInstance){
              var LocateMeControl=self.L.Control.extend({
                options:{
                  position:'bottomright'
                },
                onAdd: function (map) {
                  var img = L.DomUtil.create('img','locateMeButton');
                  img.src=scope.imgSource;
                   L.DomEvent.addListener(img, 'mousedown', L.DomEvent.stopPropagation)
                  .addListener(img, 'mousedown', L.DomEvent.preventDefault)
                  .addListener(img, 'mousedown', function () {
                    scope.imgOnClick();
                  });
                  
                  return img;
                }
              });
              var locateMe = new LocateMeControl();
              mapInstance.addControl(locateMe);

          });
       
        };
        return {
          restrict:'E',
          link:link,
          scope:{
            'imgSource':'@',
            'imgOnClick': '&'


          },
          require: '^map'
        }
      
  }
  function deviceLocationDirective(MapsLoader, locationService, $q) {
        function link(scope, element, attrs, ctrl) {
          MapsLoader.getMap.then(function(L) {
              locationService.getLocation().then(function(deviceLocation) {
              ctrl.mapInstance.then(function(mapInstance) {
                  var icon = L.icon({
                    iconUrl: 'img/user-location.svg',
                    iconRetinaUrl: 'img/user-location.svg',
                    iconSize: [25, 25],
                    iconAnchor: [12.5, 25],
                    popupAnchor: [0 , 0]
                  });
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
       'destinyOnRouteChanged': 'waiveCarDestinyOnRouteChanged',
       'withinUnlockRadius':'waiveCarWithinUnlockRadius'
     })
    .constant('transports', {
      pedestrian: 'pedestrian',
      car: 'car' 
    })
    .provider('MapsLoader', MapsLoader)
    .service('locationService', ['$rootScope', '$cordovaGeolocation', '$q', 'mapsEvents','$state', LocationService])
    .controller('mapController', ['$scope', 'locationService', '$q', 'mapsEvents', MapController])
    .directive('locateMe',['MapsLoader',locateMeDirective])
    .directive('map', ['MapsLoader', '$q', 'locationService','mapsEvents', mapDirective])
    .directive('deviceLocation', ['MapsLoader', 'locationService', '$q', deviceLocationDirective]);
})();

// controller:['$scope','locationService','$q',MapController]