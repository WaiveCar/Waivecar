function mockWalkingDirective(MapsEvents,$rootScope){
	function link(scope, element, attrs, ctrl) {
		ctrl.locationMarker.then(function(marker){
			marker.on('dragend', function(event){
				 var deviceLocation=marker.getLatLng();
	          	$rootScope.$broadcast(MapsEvents.positionChanged,{latitude:deviceLocation.lat,longitude:deviceLocation.lng});
			});
		});
	}
	return {
		restrict: 'CAE',
		link:link,
        require: '^map'
	}
}
function mockCityLocationService(LocationService, $q){
	this.LocationService = LocationService;
  this.$q = $q;
}
function mockCarAvailabilityService($q){
	this.$q=$q;
}
mockCarAvailabilityService.prototype.isCarAvailable = function() {
	return this.$q.when(true);
};
mockCityLocationService.prototype.mockLocation = function() {
  // Mock location:
  // "latitude": 34.0604643,
  // "longitude": -118.4186743,
  // "city": "Los Angeles",
  // "state": "CA",
  // "street_address": "10250 Santa Monica Blvd",
  // "zip": "90067",
	this.LocationService.setManualPosition(34.0604643, -118.4186743);
};

mockCityLocationService.prototype.getLocation = function() {
  var defered = this.$q.defer();
  var position = {
    latitude  : 34.0604643,
    longitude : -118.4186743
  };
  defered.resolve(position);
  return defered.promise;
};

angular.module('MockBehaviors', [])
.service('MockCityLocationService', [ 'LocationService', '$q', mockCityLocationService ])
.service('CarAvailabilityService',[ '$q', mockCarAvailabilityService ])
.directive('mockWalking', [ 'MapsEvents','$rootScope', mockWalkingDirective ]);
