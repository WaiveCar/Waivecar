describe('Map directive',function(){
	var $compile;
	var $httpBackend;
	var $rootScope;
	var scope;
	var $q;
	var mockMapsLoader={
	};
	var mockController={
		solveMap:function(){
		}
	}
	var mockLocationService={
	};
	
	var mockLeaflet={
		skobbler:{
			map:function(element){
				return {
					panTo:function(){

					}
				}
			}
		},
	}
	beforeEach(function(){
		angular.module('ngCordova',[]);

		angular.mock.module('Maps',function($provide,$controllerProvider){
			$provide.value("MapsLoader", mockMapsLoader);
			$provide.value("locationService", mockLocationService);
			$controllerProvider.register('mapController',function(){
				this.solveMap=function(){
					mockController.solveMap();
				}
			});
		});
		angular.mock.inject(function(_$compile_,_$httpBackend_,_$rootScope_,_$q_) {
			$compile = _$compile_;
			$httpBackend = _$httpBackend_;
			$rootScope = _$rootScope_;
			$q=_$q_;
			scope = $rootScope.$new();
			var defered=$q.defer();
			defered.resolve(mockLeaflet);
			mockMapsLoader.getMap=defered.promise;

			mockLocationService.getLocation=function(){
				var defered=$q.defer();
				defered.resolve({
					latitude:50,
					longitude:50
				});
				return defered.promise;
			}
		});
	});
	it('initializes the map on the controller with the device location on center',function(){
		spyOn(mockController,'solveMap');
		spyOn(mockLocationService, 'getLocation').and.callThrough();
		spyOn(mockMapsLoader.getMap, 'then').and.callThrough();
		var element = $compile('<map id="map"  ></map>')(scope);
		$httpBackend.whenGET('modules/maps/templates/map.html').respond('<div class="mapsInstance" ng-transclude></div>');
		$rootScope.$digest();
		$httpBackend.flush();
		expect(mockMapsLoader.getMap.then).toHaveBeenCalled();
		expect(mockController.solveMap).toHaveBeenCalled();
		expect(mockLocationService.getLocation).toHaveBeenCalled();

	});


});