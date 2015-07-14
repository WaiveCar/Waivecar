describe('Device location directive',function(){
    var solveLocationSpy=jasmine.createSpy('solveLocation')
    var mockMarker={
        addTo:function(){
            return {};
        }
    }
    var mockLeaflet={
        MakiMarkers:{
            icon:function(){
            }
        },
        marker:function(){
            return mockMarker;
        }
    };
    L=mockLeaflet;//Global
    var mockMapsLoader={
    };
    var mockLocationService={
    };
    var mockDeviceLocation={
        latitude:40,
        longitude:40
    }
    var mockMapInstance={};
    var mockController=function($scope){
        solveLocation:solveLocationSpy
    };

    beforeEach(function(){
        var self=this;
        angular.module('ngCordova',[]);
        angular.mock.module('Maps');
        angular.mock.module(function($provide,$controllerProvider,_$compileProvider_){
            self.$compileProvider=_$compileProvider_;
            $provide.value("waiveCar_MapsLoader", mockMapsLoader);
            $provide.value("waiveCar_locationService", mockLocationService);
            $provide.factory('mapDirective', function(){
                    var directive={
                        priority:0,
                        name:'map',
                        restrict:'CE',
                        scope:{
                            zoom:'@'
                        },
                        template:'<div ng-transclude></div>',
                        controllerAs:'mapController',
                        controller:mockController,
                        transclude: true,
                        $$moduleName:'app.modules.maps.main',
                        $$bindings:{}
                    };
                    return [directive];
                }
            );
           
        });
        angular.mock.inject(function(_$compile_,_$rootScope_,_$q_) {
            self.$compile = _$compile_;
            self.$rootScope = _$rootScope_;
            self.$q=_$q_;
            var defered=self.$q.defer();
            defered.resolve(mockLeaflet);
            mockMapsLoader.getMap=defered.promise;

            defered=self.$q.defer();
            defered.resolve(mockMapInstance);
            mockController.prototype.mapInstance=defered.promise;
            mockController.prototype.solveLocation=function(data){
                solveLocationSpy(data);
            }
            mockLocationService.getLocation=function(){
                var defered=self.$q.defer();
                defered.resolve(mockDeviceLocation);
                return defered.promise;
            };
            self.scope = self.$rootScope.$new();
        });
    });
    it('Solves the location with a marker  on compile',function(){
        var element = this.$compile('<map><device-location></device-location></map>')(this.scope);
        spyOn(mockMarker,'addTo').and.callThrough();
        this.$rootScope.$digest();
        expect(mockMarker.addTo).toHaveBeenCalled();
        expect(solveLocationSpy).toHaveBeenCalled();
    });
  
});