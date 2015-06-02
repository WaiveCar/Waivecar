(function() {
	function LocationService($cordovaGeolocation){
		this.$cordovaGeolocation=$cordovaGeolocation;
	}
	LocationService.prototype.getLocation = function() {
		var posOptions = {timeout: 10000, enableHighAccuracy: false};
		return this.$cordovaGeolocation
			.getCurrentPosition(posOptions)
   			.then(function (position) {
					
					return {
						latitude:position.coords.latitude,
						longitude:position.coords.longitude,
					}
				}
			);
	};
	function GMapsService(uiGmapGoogleMapApi,uiGmapIsReady,$q){
		this._googleMapsDefer= $q.defer();
		this._mapsInstancesDefer= $q.defer();
		this.googleMaps=this._googleMapsDefer.promise;
		this.mapsInstances=this._mapsInstancesDefer.promise;
		var self=this;
		uiGmapGoogleMapApi.then(this.handleGMaps.bind(this));
		uiGmapIsReady.promise(1).then(this.handleGMapsInstances.bind(this));
	}
	GMapsService.prototype.handleGMaps = function(maps) {
		this._googleMapsDefer.resolve(maps);
	};
	GMapsService.prototype.handleGMapsInstances = function(instances) {
		this._mapsInstancesDefer.resolve(instances);
	};
	function FleetService($rootScope,gMapsService){
		this.gMapsService=gMapsService;
		
	}
	FleetService.prototype.getNearbyFleet = function() {
		return this.gMapsService.googleMaps.then(function(maps){
			return [
				{latitude:40.76,longitude:-74.16,title:"[40.76,-74.16]","id":"0"},
				{latitude:41,longitude:-75,title:"[41,-75]",id:"1"},
				{latitude:40.76,longitude:-73.4,title:"[40.76,-73.4]",id:"2"},
			]
		});
	};
	function RouteService($rootScope,gMapsService,$q){
		this.gMapsService=gMapsService;
		this.$q=$q;
	}

	RouteService.prototype.getRoute = function(pointA,pointB) {
		var self=this;
		return this.gMapsService.googleMaps.then(function(maps){
			var start=new maps.LatLng(pointA.latitude,pointA.longitude);
			var finish=new maps.LatLng(pointB.latitude,pointB.longitude);
		
			return self.gMapsService.mapsInstances.then(function(instances){
				var mainInstance=instances[0].map;
				 var request = {
		            origin:start,//new maps.LatLng(40.76,-74.16),
		            destination:finish,//new maps.LatLng(40.76,-73.4),
		            travelMode: google.maps.TravelMode.DRIVING
		        };
		        var directionService=new maps.DirectionsService();
		        var deferred=self.$q.defer();
				console.debug('GOT map instances trying to get the directions');

		        directionService.route(request, function(result, status) {
					if (status == google.maps.DirectionsStatus.OK) {
						directionsDisplay = new maps.DirectionsRenderer();
						directionsDisplay.setDirections(result);
						directionsDisplay.setMap(mainInstance);
						deferred.resolve(true);
					}
         		});
         		return deferred.promise;
			});
		});
	};
	function MapController($scope,fleetService,routeService,locationService){
		$scope.map = { center: { latitude: 40.74, longitude: -74.18 }, zoom: 9 };
		var self=this;
		$scope.fleetCars=[];
		fleetService.getNearbyFleet().then(function(fleetCars){
			$scope.fleetCars=fleetCars;
			routeService.getRoute(fleetCars[0],fleetCars[1]);
			locationService.getLocation().then(function(location){
				console.log("MY CURRENT LOCATION");
				console.log(location);
				$scope.map.center=location;
				$scope.apply();
			})
		});
	}

	angular.module('starter', ['ionic','waivecar_GMapsLoader','ngCordova'])
	.service('waiveCar-locationService',['$cordovaGeolocation',LocationService])
	.service('waiveCar-gMapsService',['uiGmapGoogleMapApi','uiGmapIsReady','$q',GMapsService])
    .service('waiveCar-fleetService',['$rootScope','waiveCar-gMapsService',FleetService])
    .service('waiveCar-routeService',['$rootScope','waiveCar-gMapsService','$q',RouteService])

    .controller('waiveCar-mapCtrl',['$scope','waiveCar-fleetService','waiveCar-routeService','waiveCar-locationService',MapController])
    .directive('nearbyFleet', [function() {
                    return {
                      templateUrl:'/templates/nearbyFleet.html',
                      restrict: 'E',
                      scope:false
                    };
                  }]
    )
    .run(function($ionicPlatform) {
      $ionicPlatform.ready(function() {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if(window.cordova && window.cordova.plugins.Keyboard) {
          cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if(window.StatusBar) {
          StatusBar.styleDefault();
        }
      });
    })
})();