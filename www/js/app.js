(function() {
	function LocationService($cordovaGeolocation){
		this.$cordovaGeolocation=$cordovaGeolocation;
	}
	LocationService.prototype.getLocation = function(timeoutLimit,enableHighAccuracy) {
		timeoutLimit=timeoutLimit || 10000;
		var posOptions = {timeout: timeoutLimit, enableHighAccuracy: enableHighAccuracy};
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

	function RouteService($rootScope,GMapsLoader){

	}
	function MapController($scope,fleetService,routeService,locationService){
		$scope.getCenter=function(){
			return locationService.getLocation();
		}
	}

	function FleetService($rootScope,GMapsLoader){
		GMapsLoader.getMap.then(function(maps){
			console.log("GOT MAPS!");
		})
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
	.service('waiveCar_locationService',['$cordovaGeolocation',LocationService])
	.service('waiveCar_fleetService',['$rootScope','waiveCar_GMapsLoader',FleetService])
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