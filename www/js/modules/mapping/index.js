/*
angular.module('app.modules.mapping.services', []);
angular.module('app.modules.mapping.controllers', []);
angular.module('app.modules.mapping.directives', []);

angular.module('app.modules.mapping', [
  'app.modules.mapping.controllers',
  'app.modules.mapping.directives',
  'app.modules.mapping.services'
]).constant('EVENTS', {
  'ROUTE_DURATION_CHANGED_EVENT': 'waiveCarRouteDurationChanged',
  'ROUTE_DISTANCE_CHANGED_EVENT': 'waiveCarRouteDistanceChanged'
}).config([
  function() {
    'use strict';
  }
]).provider('mappingLoader', function () {
  'use strict';

  var options;
  function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=waiveCar_mapsCallback';
    document.body.appendChild(script);
  };

  var provider = {
    $get: [
      '$q',
      '$window',
      function($q, $window) {
        var deferred = $q.defer();

        $window.waiveCar_mapsCallback = function() {
          deferred.resolve(google.maps);
        };

        loadScript();

        return {
          getMap: deferred.promise
        };

      }
    ],

    setOption: [
      function() {
      //TBD
      }
    ]
  };
  return provider;
});

*/


(function() {
  var apiKey='7ef929e2c765b1194804e5e8ca284c5a';
  function MapsLoader(){

    var options;
    return{
      $get:function($q,$window){
        L.skobbler.apiKey=apiKey;
          var deferred = $q.defer();
          deferred.resolve(L);
        return {
          getMap:deferred.promise
        }
      },
      setOption:function(){
        //TBD
      }
    }
  }
  angular.module('Maps', [])
  .provider('waiveCar_MapsLoader',MapsLoader);
  var ROUTE_DURATION_CHANGED_EVENT='waiveCarRouteDurationChanged';
  var ROUTE_DISTANCE_CHANGED_EVENT='waiveCarRouteDistanceChanged'
  var TRANSPORT_PEDESTRIAN='pedestrian';
  var TRANSPORT_CAR='car';

  function LocationService($rootScope,$cordovaGeolocation,$q){
    this.$cordovaGeolocation=$cordovaGeolocation;
    this.$q=$q;
    this.savedLocation;
    var self=this;
  }
  LocationService.prototype.getLocation = function(timeoutLimit,enableHighAccuracy) {
    timeoutLimit=timeoutLimit || 10000;
    var posOptions = {timeout: timeoutLimit, enableHighAccuracy: enableHighAccuracy};
    var defered=this.$q.defer();
    if(this.savedLocation){
      defered.resolve(this.savedLocation);
      return defered.promise;
    }
    this.$cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
          defered.resolve(
            {
              latitude:position.coords.latitude,
              longitude:position.coords.longitude,
            }
          )
          
        }
      );
    return defered.promise;

  };
  function RealReachService($rootScope,MapsLoader,$q,$http,locationService){
    this.MapsLoader=MapsLoader;
    this._scope=$rootScope;
    this.$q=$q;
    this.$http=$http;
    this.locationService=locationService;
  }
  RealReachService.prototype.getReachInMinutes = function(minutes,transport) {
    var self=this;
    return this.MapsLoader.getMap.then(function(maps){
      var defered=self.$q.defer();
      self.locationService.getLocation().then(function(location){
        var url="http://"+maps.skobbler.apiKey+".tor.skobbler.net/tor/RSngx/RealReach/json/18_0/en/"+maps.skobbler.apiKey;
        url+='?response_type=gps';
        url+='&units=sec';
        url+='&nonReachable=0';
        url+='&range='+(minutes*60);
        url+='&transport='+transport;


        url+='&start='+location.latitude+','+location.longitude;

        self.$http.get(url)
        .success(function(data, status, headers, config) {
          console.log(data);
          defered.resolve(data);
        })
        .error(function(data, status, headers, config) {
          defered.reject({data:data,status:status,header:headers,config:config});
        });

      });
      return defered.promise;
    });
  };
  function RouteService($rootScope,MapsLoader,$q,$http){
    this.MapsLoader=MapsLoader;
    this.$q=$q;
    this.$http=$http;
    this._scope=$rootScope;
  }

  RouteService.prototype.getRoute = function(pointA,pointB) {

    var self=this;
    return this.MapsLoader.getMap.then(function(maps){
      var url="http://"+maps.skobbler.apiKey+".tor.skobbler.net/tor/RSngx/calcroute/json/18_0/en/"+maps.skobbler.apiKey;
      url+='?start='+pointA.lat+","+pointA.lng;
      url+='&dest='+pointB.lat+","+pointB.lng;
      url+='&profile=pedestrian';
      url+='&advice=yes';

      url+='&points=yes';
      var defered=self.$q.defer();
      self.$http.get(url)
      .success(function(data, status, headers, config) {
        self._scope.$broadcast(ROUTE_DURATION_CHANGED_EVENT,data.route.duration);
        self._scope.$broadcast(ROUTE_DISTANCE_CHANGED_EVENT,data.route.routelength);
        defered.resolve(data);
      })
      .error(function(data, status, headers, config) {
        defered.reject({data:data,status:status,header:headers,config:config});
      });
      return defered.promise;
    });
  };

  function RouteTimeController($scope,routeService){
    $scope.$on(ROUTE_DURATION_CHANGED_EVENT, function(ev,totalTime) {
      var timeToDisplay;
      var timeInHours;
      var timeInMinutes=Math.floor(totalTime/60);
      if(timeInMinutes<=0){
        timeToDisplay='< 1m';
      }
      else if(timeInMinutes>60){
        var timeInHours=Math.floor(timeInMinutes/60);
        timeInMinutes=timeInMinutes-timeInHours*60;
        if(timeInMinutes<10){
          timeInMinutes='0'+timeInMinutes;
        }
        timeToDisplay=timeInHours+':'+timeInMinutes;
      }
      else{
        if(timeInMinutes<10){
          timeInMinutes='0'+timeInMinutes;
        }
        timeToDisplay='00h'+timeInMinutes;
      }

      $scope.value=timeToDisplay;
    });
  }
  function RouteDurationController($scope,routeService){
    $scope.$on(ROUTE_DISTANCE_CHANGED_EVENT, function(ev,totalDistance) {
      $scope.value=totalDistance+" m";
    });
  }

  function MapController($scope,locationService,$q){
    this._deferedMap=$q.defer();
    this.mapInstance=this._deferedMap.promise;

    this._deferedLocation=$q.defer();
    this.locationMarker=this._deferedLocation.promise;

    this._deferedDestiny=$q.defer();
    this.destinyMarker=this._deferedDestiny.promise;
    this._scope=$scope;
  }
  MapController.prototype.updateTileCount = function(tileCount) {
    this._scope.tileCount=tileCount;
    console.log(tileCount);
  };
  MapController.prototype.solveMap = function(mapInstance) {
    this._deferedMap.resolve(mapInstance);
  };
  MapController.prototype.solveLocation = function(locationMarker) {
    this._deferedLocation.resolve(locationMarker);
  };
  MapController.prototype.solveDestiny = function(destinyMarker) {
    this._deferedDestiny.resolve(destinyMarker);
  };
  function FleetService($rootScope,$q,LocationService){
    this.$q=$q;
    this.locationService=LocationService;
  
  }
  FleetService.prototype.getNearbyFleet = function(numNearby) {
    //Mockup to get nearby fleet nearby of person,On production it'll send to server
      numNearby=numNearby || 10;
      var maxDiff=0.005;
      var minDiff=0.0005;

      //mockups
      return this.locationService.getLocation().then(function(deviceLocation){ 
      var ret=[];

      for(var i=0;i<numNearby;i++){
        var diffA=Math.random() * (maxDiff - minDiff) + minDiff;
        var diffB=Math.random() * (maxDiff - minDiff) + minDiff
        if(Math.random()<.5){
          diffA=diffA*-1;
        }
        if(Math.random()<.5){
          diffB=diffB*-1;
        }
        ret.push(
          {
            latitude:deviceLocation.latitude+diffA,
            longitude:deviceLocation.longitude+diffB
          }
        )
      }
      return ret;
      },function(error){
      });
  }
  function nearbyFleetDirective(MapsLoader,$q,fleetService,realReachService){
    

    function link(scope, element, attrs,ctrl) {
      fleetService.getNearbyFleet().then(function(fleet){ 
        MapsLoader.getMap.then(function(L){
          ctrl.mapInstance.then(function(mapInstance){
            var latLng;
            var markers=[];
            fleet.forEach(function(f){
              markers.push(L.marker([f.latitude,f.longitude]).addTo(mapInstance));
            });
            realReachService.getReachInMinutes(15,TRANSPORT_PEDESTRIAN).then(function(reach){
              var numPoints=reach.realReach.gpsPoints.length;
              var polygonPoints=[];
              var latLng;
              //No idea why we have to skip the first 8
              for(var i=8;i<numPoints;i+=2){
                //No idea why they invert this also
                latLng=new L.LatLng(reach.realReach.gpsPoints[i+1], reach.realReach.gpsPoints[i]);
                polygonPoints.push(latLng);
              }
                  var polygon = new L.Polygon(polygonPoints);
              mapInstance.addLayer(polygon);
              scope.reachPolygon=polygon;
              ctrl.solveDestiny(L.marker(latLng).addTo(mapInstance));
            });
          });
        });

      });
    }
    return {
      restrict:'CE',
      link: link,
      require:'^map'
    }
  }
  function deviceLocationDirective(MapsLoader,locationService,$q){
    function link(scope,element,attrs,ctrl){
      MapsLoader.getMap.then(function(L){
          locationService.getLocation().then(function(deviceLocation){
            ctrl.mapInstance.then(function(mapInstance){
              var icon = L.MakiMarkers.icon({icon: "pitch", size: "m"});
              var marker=L.marker([deviceLocation.latitude,deviceLocation.longitude],{draggable:true,icon:icon}).addTo(mapInstance);
              ctrl.solveLocation(marker);
            });
          });
        });
      
    }
    return {
      link:link,
      require:'^map',
      scope:{}

    }
  }
  function mapDirective(MapsLoader,$q,locationService){
    
    function link(scope, element, attrs,ctrl) {
      MapsLoader.getMap.then(function(maps){

         locationService.getLocation().then(function(deviceLocation){
          var mapOptions={
                center: [deviceLocation.latitude, deviceLocation.longitude],
                apiKey:L.skobbler.apiKey,
                zoom:parseInt(scope.zoom,10)
          }
          var mapInstance=L.skobbler.map(element[0].firstChild,mapOptions);
          ctrl.solveMap(mapInstance);
        })

        
      });

    }
    return {
      restrict:'CE',
      scope:{
        zoom:'@'
      },
      templateUrl:'js/modules/mapping/templates/map.html',
      link: link,
      transclude: true,
      controller:['$scope','waiveCar_locationService','$q',MapController]

    };
  }
  function routeToNearestDirective(MapsLoader,$q,routeService){
    function drawRoute(L,startLocation,destinyLocation,mapInstance,scope){
      return routeService.getRoute(startLocation.getLatLng(),destinyLocation.getLatLng())
        .then(function(result){
          console.log(result);
          var coordinates=[];
          result.route.routePoints.forEach(function(p){
            coordinates.push([p.x,p.y]);
          })
          var lines=[
            {
              "type": "LineString",
              "coordinates":coordinates
            }
          ];
          if(scope.route){
            mapInstance.removeLayer(scope.route);
          }
          scope.route=L.geoJson(lines);
          scope.route.addTo(mapInstance);
          var unlockRangeOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
          };
          var radius=25;
          scope.unlockRadius=L.circle(destinyLocation.getLatLng(),radius,unlockRangeOptions).addTo(mapInstance);
          console.log(scope.route.getBounds());
          // mapInstance.panTo(startLocation.getLatLng());
           mapInstance.fitBounds(scope.route.getBounds());
        });
    }
    function mockWalking(maps,startLocation,destinyLocation,mapInstance,scope){
      startLocation.on('dragend',function(ev){
        drawRoute(maps,startLocation,destinyLocation,mapInstance,scope).then(function(){
          var deviceLocation=startLocation.getLatLng();
          if(scope.unlockRadius.getBounds().contains(deviceLocation)){
          }
        });
      });
    }
    function link(scope, element, attrs,ctrl) {

      MapsLoader.getMap.then(function(maps){

        ctrl.mapInstance.then(function(mapInstance){
          ctrl.locationMarker.then(function(startLocation){
            ctrl.destinyMarker.then(function(destinyLocation){
              drawRoute(maps,startLocation,destinyLocation,mapInstance,scope).then(function(){
                mockWalking(maps,startLocation,destinyLocation,mapInstance,scope);

              })
            });
          });
        });
      });
    }
    return {
      restrict:'E',
      require:'^map',
      link:link
    }
  }

  function mapsInfoDirective(MapsLoader){
    function link(scope, element, attrs,ctrl) {
      MapsLoader.getMap.then(function(L){
        var div=element[0].firstChild;

        var Control = L.Control.extend({
          options: {
            position: 'topright'
          },

          onAdd: function (map) {
            return div;
          }
        });
        ctrl.mapInstance.then(function(mapInstance){
          mapInstance.addControl(new Control());
        });

      });
    }
    return {
      restrict:'E',
      require:'^map',
      templateUrl:'js/modules/mapping/templates/mapsInfoContainer.html',
      link:link
    }
  }
  angular.module('app.modules.mapping', ['Maps','ngCordova'])
  .service('waiveCar_locationService',['$rootScope','$cordovaGeolocation','$q',LocationService])
  .service('waiveCar_fleetService',['$rootScope','$q','waiveCar_locationService',FleetService])
  .service('waiveCar_routeService',['$rootScope','waiveCar_MapsLoader','$q','$http',RouteService])
  .service('waiveCar_realReachService',['$rootScope','waiveCar_MapsLoader','$q','$http','waiveCar_locationService',RealReachService])


  .controller('RouteTimeController',['$scope','waiveCar_routeService',RouteTimeController])
  .controller('RouteDurationController',['$scope','waiveCar_routeService',RouteDurationController])


  .directive('map',['waiveCar_MapsLoader','$q','waiveCar_locationService',mapDirective])
  .directive('deviceLocation',['waiveCar_MapsLoader','waiveCar_locationService','$q',deviceLocationDirective])
  .directive('nearbyFleet',['waiveCar_MapsLoader','$q','waiveCar_fleetService','waiveCar_realReachService',nearbyFleetDirective])
  .directive('routeToNearestCar',['waiveCar_MapsLoader','$q','waiveCar_routeService',routeToNearestDirective])
  .directive('mapsInfo',['waiveCar_MapsLoader',mapsInfoDirective])

})();