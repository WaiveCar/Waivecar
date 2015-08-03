function mockWalkingDirective(mapsEvents,$rootScope){
	function link(scope, element, attrs, ctrl) {
		ctrl.locationMarker.then(function(marker){
			marker.on('dragend', function(event){
				 var deviceLocation=marker.getLatLng();
	          	$rootScope.$broadcast(mapsEvents.positionChanged,{latitude:deviceLocation.lat,longitude:deviceLocation.lng});
			});
		});
	}
	return {
		restrict: 'CAE',
		link:link,
        require: '^map'
	}
}
function mockCityLocationService(locationService){
	this.locationService=locationService;
}
mockCityLocationService.prototype.mockLocation = function() {
  // Mock location:
  // "latitude": 34.0604643,
  // "longitude": -118.4186743,
  // "city": "Los Angeles",
  // "state": "CA",
  // "street_address": "10250 Santa Monica Blvd",
  // "zip": "90067",
	this.locationService.setManualPosition(34.0604643, -118.4186743);
};

angular.module('mockBehaviours', [])
.service('mockCityLocationService', [ 'locationService',mockCityLocationService ])
.directive('mockWalking', [ 'mapsEvents','$rootScope',mockWalkingDirective ]);
