
(function() {
	
	function LocationService($cordovaGeolocation,$q){
		this.$cordovaGeolocation=$cordovaGeolocation;
		this.$q=$q;
		this.mockLocationMarker;
	}
	LocationService.prototype.getLocation = function(timeoutLimit,enableHighAccuracy) {
		timeoutLimit=timeoutLimit || 10000;
		var posOptions = {timeout: timeoutLimit, enableHighAccuracy: enableHighAccuracy};
		var defered=this.$q.defer();
		if(this.mockLocationMarker){
			defered.resolve({
				latitude:this.mockLocationMarker.getPosition().lat(),
				longitude:this.mockLocationMarker.getPosition().lng()
			})
			
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

	function RouteService($rootScope,GMapsLoader,$q){
		this.GMapsLoader=GMapsLoader;
		this.$q=$q;
	}

	RouteService.prototype.getRoute = function(pointA,pointB) {

		var self=this;
		return this.GMapsLoader.getMap.then(function(maps){
			var start=pointA;
			var finish=pointB;

			var request = {
				origin:start,//new maps.LatLng(40.76,-74.16),
				destination:finish,//new maps.LatLng(40.76,-73.4),
				travelMode: maps.TravelMode.DRIVING
			};
			var directionService=new maps.DirectionsService();
			var defered=self.$q.defer();

			directionService.route(request, function(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					
					defered.resolve(result);
				}
				});
				return defered.promise;
		});
	};
	function DebugController($scope){
		$scope.debugText="Lorem ipsum dolor";
	}
	function MapController($scope,routeService,locationService,$q){
		this._deferedMap=$q.defer();
		this.mapInstance=this._deferedMap.promise;
		this._deferedLocation=$q.defer();
		this.locationMarker=this._deferedLocation.promise;
		this._deferedDestiny=$q.defer();
		this.destinyMarker=this._deferedDestiny.promise;

	}
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
	function nearbyFleetDirective(GMapsLoader,$q,fleetService){
		

		function link(scope, element, attrs,ctrl) {
			fleetService.getNearbyFleet().then(function(fleet){	
				GMapsLoader.getMap.then(function(gMaps){

					ctrl.mapInstance.then(function(mapInstance){
						var latLng;
						var markers=[];
						fleet.forEach(function(f){
							latLng = new gMaps.LatLng(f.latitude,f.longitude);
							markers.push(
								new gMaps.Marker({
									position: latLng,
									map: mapInstance,
								})
							);
							ctrl.solveDestiny(markers[0]);

						});
					});
				});

			});
		}
		return {
			restrict:'CE',
			link: link,
			require:'^gMap'
		}
	}
	function deviceLocationDirective(GMapsLoader,locationService,$q){
		function link(scope,element,attrs,ctrl){
				GMapsLoader.getMap.then(function(gMaps){

					locationService.getLocation().then(function(deviceLocation){
						ctrl.mapInstance.then(function(mapInstance){
							latLng = new gMaps.LatLng(deviceLocation.latitude,deviceLocation.longitude);
							scope.marker=new gMaps.Marker({
								map: mapInstance,
								position: latLng,
								animation: gMaps.Animation.BOUNCE,
								draggable:true,
								icon: {
									path: gMaps.SymbolPath.CIRCLE,
									scale: 10
								}
							});
							locationService.mockLocationMarker=scope.marker;

							ctrl.solveLocation(scope.marker);
						});
					});
				});
			
		}
		return {
			link:link,
			require:'^gMap',
			scope:{}

		}
	}
	function mapDirective(GMapsLoader,$q,locationService){
		
		function link(scope, element, attrs,ctrl) {
			GMapsLoader.getMap.then(function(maps){

				 locationService.getLocation().then(function(deviceLocation){

					 var mapOptions = {
						zoom: parseInt(scope.zoom,10),
						center: new maps.LatLng(deviceLocation.latitude, deviceLocation.longitude)
					};

					var mapInstance=new maps.Map(element[0].firstChild,mapOptions);
					ctrl.solveMap(mapInstance);
				})
				
			});

		}
		return {
			restrict:'CE',
			scope:{
				zoom:'@'
			},
			templateUrl:'templates/map.html',
			link: link,
			transclude: true,
			controller:['$scope','waiveCar_routeService','waiveCar_locationService','$q',MapController]

		};
	}
	function routeToNearestDirective(GMapsLoader,$q,routeService){
		function mockWalking(gMaps,startLocation,destinyLocation,mapInstance,scope){
			gMaps.event.addListener(startLocation, "dragend", function(event) { 
				var lat = event.latLng.lat(); 
				var lng = event.latLng.lng(); 
				routeService.getRoute(startLocation.getPosition(),destinyLocation.getPosition())
				.then(function(result){
					scope.directionsDisplay.setMap(null);
					scope.directionsDisplay.setDirections(result);
					scope.directionsDisplay.setMap(mapInstance);
					mapInstance.setCenter(startLocation.getPosition());
				});
			}); 
		}
		function link(scope, element, attrs,ctrl) {

			GMapsLoader.getMap.then(function(maps){

				scope.directionsDisplay = new maps.DirectionsRenderer({suppressMarkers: true});
				ctrl.mapInstance.then(function(mapInstance){
					ctrl.locationMarker.then(function(startLocation){
						ctrl.destinyMarker.then(function(destinyLocation){
							
							
							routeService.getRoute(startLocation.getPosition(),destinyLocation.getPosition())
								.then(function(result){
									scope.directionsDisplay.setMap(null);
									scope.directionsDisplay.setDirections(result);
									scope.directionsDisplay.setMap(mapInstance);

									mockWalking(maps,startLocation,destinyLocation,mapInstance,scope);

								});
						});
					});
				});
			});
		}
		return {
			restrict:'E',
			require:'^gMap',
			link:link
		}
	}
	angular.module('mapConcept', ['ionic','GMaps','ngCordova'])
	.service('waiveCar_locationService',['$cordovaGeolocation','$q',LocationService])
	.service('waiveCar_fleetService',['$rootScope','$q','waiveCar_locationService',FleetService])
	.service('waiveCar_routeService',['$rootScope','waiveCar_GMapsLoader','$q',RouteService])
	.controller('debugCtrl',['$scope',DebugController])

	.directive('gMap',['waiveCar_GMapsLoader','$q','waiveCar_locationService',mapDirective])
	.directive('nearbyFleet',['waiveCar_GMapsLoader','$q','waiveCar_fleetService',nearbyFleetDirective])
	.directive('deviceLocation',['waiveCar_GMapsLoader','waiveCar_locationService','$q',deviceLocationDirective])
	.directive('routeToNearestCar',['waiveCar_GMapsLoader','$q','waiveCar_routeService',routeToNearestDirective])

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