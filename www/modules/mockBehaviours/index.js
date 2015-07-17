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
        require: '^map',

	}
}
angular.module('mockBehaviours', [])
.directive('mockWalking', ['mapsEvents','$rootScope',mockWalkingDirective]);