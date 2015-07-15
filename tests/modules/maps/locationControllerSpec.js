//mapController
describe('Location controller',function(){
	var controller;
	var $rootScope;
	var scope;
	var $q;
	var events;
	var mockLocationService={

	};
	var mockMarker={
		setLatLng:function(position){

		}
	}
	beforeEach(function(){
        angular.module('ngCordova',[]);
		angular.mock.module('Maps');
		angular.mock.module(function($provide){
			$provide.value("locationService", mockLocationService);
		});
		angular.mock.inject(function(_$rootScope_,_$q_,mapsEvents,$controller){
			$q=_$q_;
			$rootScope=_$rootScope_;
			scope = $rootScope.$new();
			events=mapsEvents;
			controller=$controller('mapController', {$scope: scope,$q:$q,mapsEvents:mapsEvents,locationService:mockLocationService});

		});

	});
	it('Updates the marker position when the geolocation updates',function(){
		controller.solveLocation(mockMarker);
		spyOn(mockMarker,'setLatLng');
		$rootScope.$digest();

		var position={latitude:50,longitude:50};
		$rootScope.$broadcast(events.positionChanged,position);
		expect(mockMarker.setLatLng).toHaveBeenCalledWith([50,50]);
	});
});
