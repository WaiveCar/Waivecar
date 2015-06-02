(function() {
	function LocationService($cordovaGeolocation,$q){
		this.$cordovaGeolocation=$cordovaGeolocation;
		this.$q=$q;
	}
	LocationService.prototype.getLocation = function(timeoutLimit,enableHighAccuracy) {
		console.debug("Calling get location");

		timeoutLimit=timeoutLimit || 10000;
		var posOptions = {timeout: timeoutLimit, enableHighAccuracy: enableHighAccuracy};
		var deferred=this.$q.defer();
		this.$cordovaGeolocation
			.getCurrentPosition(posOptions)
			.then(function (position) {
					console.debug('GOT location');
					deferred.resolve(
						{
							latitude:position.coords.latitude,
							longitude:position.coords.longitude,
						}
					)
					
				}
			);
		return deferred.promise;

	};

	function RouteService($rootScope,GMapsLoader){

	}
	function MapController($scope,fleetService,routeService,locationService){
		fleetService.getNearbyFleet().then(function(fleet){	
			console.debug("THE nearby fleet");
			console.debug(JSON.stringify(fleet));

		});
		$scope.getCenter=function(){

			return locationService.getLocation();
		}
	}

	function FleetService($rootScope,$q,LocationService){
		this.$q=$q;
		this.locationService=LocationService;
	
	}
	FleetService.prototype.getNearbyFleet = function() {

		//Mockup to get nearby fleet nearby of person,On production it'll send to server
	    var deferred = this.$q.defer();
	    var numNearby=10;
	    var maxDiff=0.5;
	    console.debug('Getting nearby fleet');
	    //mockups
	    return this.locationService.getLocation().then(function(centerLocation){ 
			var ret=[];
			console.debug('Nearby fleet centerLocation '+centerLocation);

			for(var i=0;i<numNearby;i++){
				ret.push(
					{
						latitude:centerLocation.latitude+Math.random(),
						longitude:centerLocation.longitude+Math.random()
					}
				)
			}
			deferred.resolve(ret);
	    },function(error){
	    	console.error('PAU '+ JSON.stringify(error));
	    });

	    return deferred.promise;
	}
	function mapDirective(GMapsLoader){
		function link(scope, element, attrs) {
			GMapsLoader.getMap.then(function(maps){
				return scope.center().then(function(centerPosition){
					 var mapOptions = {
						zoom: 8,
						center: new maps.LatLng(centerPosition.latitude, centerPosition.longitude)
					};
					var mapInstance=new maps.Map(element[0],mapOptions);
					return mapInstance;
				})
				
			});

		}
		return {
			restrict:'CE',
			scope:{center:'&'},
			link: link
		};
	}
	angular.module('mapConcept', ['ionic','GMaps','ngCordova'])
	.service('waiveCar_locationService',['$cordovaGeolocation','$q',LocationService])
	.service('waiveCar_fleetService',['$rootScope','$q','waiveCar_locationService',FleetService])
	.service('waiveCar_routeService',['$rootScope','waiveCar_GMapsLoader',RouteService])
	.controller('waiveCar_mapCtrl',['$scope','waiveCar_fleetService','waiveCar_routeService','waiveCar_locationService',MapController])
	.directive('gMap',['waiveCar_GMapsLoader',mapDirective])
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