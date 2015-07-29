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
function mockSanFranLocationService(locationService){
	this.locationService=locationService;
}
mockSanFranLocationService.prototype.mockLocation = function() {
	this.locationService.setManualPosition(37.422292, -122.148153);
	
};
angular.module('mockBehaviours', [])
.service('mockSanFranLocationService',['locationService',mockSanFranLocationService])
.directive('mockWalking', ['mapsEvents','$rootScope',mockWalkingDirective]);