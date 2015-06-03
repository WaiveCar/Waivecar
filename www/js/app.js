(function() {
	function LocationService($cordovaGeolocation,$q){
		this.$cordovaGeolocation=$cordovaGeolocation;
		this.$q=$q;
	}
	LocationService.prototype.getLocation = function(timeoutLimit,enableHighAccuracy) {

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
	function MapController($scope,fleetService,routeService,locationService,GMapsLoader){

		$scope.getCenter=function(){

			return locationService.getLocation();
		}
		$scope.whenMapLoaded=function(mapInstance){
			//@todo throw that on nearby fleet directive
			fleetService.getNearbyFleet().then(function(fleet){	
				console.log("GOT NEARBU FLEET AND IT IS AS FOLLOWS");
				console.debug(JSON.stringify(fleet));
				GMapsLoader.getMap.then(function(gMaps){
					console.log('GOT THE MAP AND WILL DRAW');
					var latLng;
					fleet.forEach(function(f){
						 latLng = new gMaps.LatLng(f.latitude,f.longitude);
						 console.log('DRAWING '+latLng);
						 console.log(mapInstance);
						new gMaps.Marker({
							position: latLng,
							map: mapInstance,
						});

					});
				});

			});
		}
	}


	function FleetService($rootScope,$q,LocationService){
		this.$q=$q;
		this.locationService=LocationService;
	
	}
	FleetService.prototype.getNearbyFleet = function(numNearby) {

		//Mockup to get nearby fleet nearby of person,On production it'll send to server
	    numNearby=numNearby || 10;
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
			return ret;
	    },function(error){
	    	console.error('PAU '+ JSON.stringify(error));
	    });
	}
	function mapDirective(GMapsLoader,$q){
		function link(scope, element, attrs) {

			GMapsLoader.getMap.then(function(maps){
				 scope.center().then(function(centerPosition){
					 var mapOptions = {
						zoom: 8,
						center: new maps.LatLng(centerPosition.latitude, centerPosition.longitude)
					};
					var mapInstance=new maps.Map(element[0],mapOptions);
					scope.mapLoaded({mapInstance:mapInstance});
				})
				
			});

		}
		return {
			restrict:'CE',
			scope:{
				center:'&',
				mapLoaded:'&'
			},
			link: link
		};
	}
	angular.module('mapConcept', ['ionic','GMaps','ngCordova'])
	.service('waiveCar_locationService',['$cordovaGeolocation','$q',LocationService])
	.service('waiveCar_fleetService',['$rootScope','$q','waiveCar_locationService',FleetService])
	.service('waiveCar_routeService',['$rootScope','waiveCar_GMapsLoader',RouteService])
	.controller('waiveCar_mapCtrl',['$scope','waiveCar_fleetService','waiveCar_routeService','waiveCar_locationService','waiveCar_GMapsLoader',MapController])
	.directive('gMap',['waiveCar_GMapsLoader','$q',mapDirective])
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