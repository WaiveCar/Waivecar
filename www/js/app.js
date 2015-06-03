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
	function MapController($scope,fleetService,routeService,locationService,GMapsLoader,$q){
		this._deferedMap=$q.defer();
		this.mapInstance=this._deferedMap.promise;

	}
	MapController.prototype.solveMap = function(mapInstance) {
		this._deferedMap.resolve(mapInstance);
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
	    return this.locationService.getLocation().then(function(centerLocation){ 
			var ret=[];

			for(var i=0;i<numNearby;i++){
				var diffA=Math.random() * (maxDiff - minDiff) + minDiff;
				var diffB=Math.random() * (maxDiff - minDiff) + minDiff
				ret.push(
					{
						latitude:centerLocation.latitude+diffA,
						longitude:centerLocation.longitude+diffB
					}
				)
			}
			return ret;
	    },function(error){
	    	console.error('PAU '+ JSON.stringify(error));
	    });
	}
	function nearbyFleetDirective(GMapsLoader,$q,fleetService){
		
		function link(scope, element, attrs,ctrl) {
			fleetService.getNearbyFleet().then(function(fleet){	
				GMapsLoader.getMap.then(function(gMaps){
					ctrl.mapInstance.then(function(mapInstance){
						var latLng;
						fleet.forEach(function(f){
							latLng = new gMaps.LatLng(f.latitude,f.longitude);
							new gMaps.Marker({
								position: latLng,
								map: mapInstance,
							});
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
	function centerLocationDirective(GMapsLoader,locationService,$q){
		function link(scope,element,attrs,ctrl){

		}
		return {
			link:link,
		}
	}
	function mapDirective(GMapsLoader,$q,locationService){
		function link(scope, element, attrs,ctrl) {

			GMapsLoader.getMap.then(function(maps){
				 locationService.getLocation().then(function(centerPosition){
					 var mapOptions = {
						zoom: 15,
						center: new maps.LatLng(centerPosition.latitude, centerPosition.longitude)
					};

					var mapInstance=new maps.Map(element[0].firstChild,mapOptions);
					ctrl.solveMap(mapInstance);
				})
				
			});

		}
		return {
			restrict:'CE',
			scope:{
				mapLoaded:'&'
			},
			templateUrl:'/templates/map.html',
			link: link,
			transclude: true,
			controller:['$scope','waiveCar_fleetService','waiveCar_routeService','waiveCar_locationService','waiveCar_GMapsLoader','$q',MapController]

		};
	}
	angular.module('mapConcept', ['ionic','GMaps','ngCordova'])
	.service('waiveCar_locationService',['$cordovaGeolocation','$q',LocationService])
	.service('waiveCar_fleetService',['$rootScope','$q','waiveCar_locationService',FleetService])
	.service('waiveCar_routeService',['$rootScope','waiveCar_GMapsLoader',RouteService])
	.directive('gMap',['waiveCar_GMapsLoader','$q','waiveCar_locationService',mapDirective])
	.directive('nearbyFleet',['waiveCar_GMapsLoader','$q','waiveCar_fleetService',nearbyFleetDirective])

	.directive('centerLocation',['waiveCar_GMapsLoader','waiveCar_locationService','$q',centerLocationDirective])

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