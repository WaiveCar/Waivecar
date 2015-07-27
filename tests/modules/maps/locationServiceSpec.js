describe('Location service',function(){
	var service
	var $rootScope;
	var scope;
	var $q;
	var events;
	var mockState={

	}
	var mockGeoLocation={
		_thenTrigger:function(){
			if(typeof this._successCb != 'undefined'){
				this._successCb({
					coords:{
						latitude:50.00,
						longitude:50.00
					}
				})
			}
		},
		getCurrentPosition:function(options){
				var defered=$q.defer();
				var p=defered.promise;
				defered.resolve(
					{	
						coords:{
							latitude:50.00,
							longitude:50.00
						}
					}
				);
				return defered.promise;
		},
		watchPosition:function(options){
			var self=this;
			var then= function(something,errorCb,successCb){
				self._successCb=successCb;
			}
			return {then:then};
		}
	};
	beforeEach(function(){
		spyOn(mockGeoLocation, 'getCurrentPosition').and.callThrough();
		spyOn(mockGeoLocation, 'watchPosition').and.callThrough();

		angular.module('ngCordova',[]);
		angular.mock.module('Maps',function($provide){
			  $provide.value("$cordovaGeolocation", mockGeoLocation);
  			  $provide.value("$state", mockState);

		});
		angular.mock.inject(function(_$rootScope_,_$q_,mapsEvents,locationService){
			$q=_$q_;
			$rootScope=_$rootScope_;
			spyOn($rootScope, '$broadcast');
			scope = $rootScope.$new();
			events=mapsEvents;
			service=locationService;
		});

	});


	describe('Geolocation',function(){
		it('Gets the location upon request',function(){
		    var handler = jasmine.createSpy('');
			var p=service.getLocation();
			p.then(handler);
			$rootScope.$digest();
			expect(handler).toHaveBeenCalled();
			expect(mockGeoLocation.getCurrentPosition).toHaveBeenCalled();
		});
		it('Watches the location countinuously',function(){
			service.init();
			mockGeoLocation._thenTrigger();
			expect(mockGeoLocation.watchPosition).toHaveBeenCalled();
			expect($rootScope.$broadcast).toHaveBeenCalled();
			var lastArgs=$rootScope.$broadcast.calls.mostRecent().args;
			expect(lastArgs[0]).toEqual(events.positionChanged);
		});


	});
});