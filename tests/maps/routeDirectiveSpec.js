describe('Route directive',function(){
    var addToMap=jasmine.createSpy('addToMap');
    var mockLeaflet={
        geoJson:function(){
            return {
                addTo:addToMap,
                getBounds:function(){

                }
            }
        },
        circle:function(){
            return {
                addTo:function(){
                }
            }
        }
    };
    L=mockLeaflet;//Global
    var mockMapsLoader={
    };
    var mockRouteService={
    };
    var mockController=function($scope){
    };
    var mockLocationMarker={
        getLatLng:function(){

        },
        setLatLng:function(){

        }
    }
    var mockMapInstance={
        fitBounds:function(){

        }
    }
    var mockDestinyMarker={
        getLatLng:function(){
        }
    }
    var mockEvents={
        'positionChanged':'waiveCarPositionChanged',
        'destinyOnRouteChanged':'waiveCarDestinyOnRouteChanged'
    };
    var mockRoute={
        route:{
            routePoints:[
                {
                    x:10,
                    y:20
                }
            ]
        },
    }

    beforeEach(function(){
        var self=this;
        angular.module('app.modules.maps.main',[]);
        angular.mock.module('app.modules.maps.route');
        angular.mock.module(function($provide,$controllerProvider,_$compileProvider_){
            self.$compileProvider=_$compileProvider_;
            $provide.value("waiveCar_MapsLoader", mockMapsLoader);
            $provide.value("waiveCar_routeService", mockRouteService);
            $provide.value('mapsEvents',mockEvents);
            self.$compileProvider.directive('map', function() {
                return {
                    restrict:'CE',
                    scope:{
                        zoom:'@'
                    },
                    template:'<div ng-transclude></div>',
                    controllerAs:'mapController',
                    controller:mockController,
                    transclude: true
                };
            });
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

            defered=self.$q.defer();
            defered.resolve(mockLocationMarker);
            mockController.prototype.locationMarker=defered.promise;

            defered=self.$q.defer();
            defered.resolve(mockDestinyMarker);
            mockController.prototype.destinyMarker=defered.promise;


            defered=self.$q.defer();
            defered.resolve(mockRoute);
            mockRouteService.getRoute=function(){
                return defered.promise;
            }
            self.scope = self.$rootScope.$new();
        });
    });
    it('Draws the route on compile',function(){
        var element = this.$compile('<map ><route-to-car></route-to-car></map>')(this.scope);
        this.$rootScope.$digest();
        //@todo find a beetter way to test it 
        expect(addToMap).toHaveBeenCalled();
    });
    it('Redraws the when position is changed',function(){
        var element = this.$compile('<map ><route-to-car></route-to-car></map>')(this.scope);
        this.$rootScope.$digest();
        this.$rootScope.$broadcast(mockEvents.positionChanged,{latitude:50,longitude:50});
        expect(addToMap).toHaveBeenCalled();
    });
    it('Redraws the route when the destiny is changed',function(){
        var element = this.$compile('<map ><route-to-car></route-to-car></map>')(this.scope);
        this.$rootScope.$digest();
        this.$rootScope.$broadcast(mockEvents.destinyOnRouteChanged);
        expect(addToMap).toHaveBeenCalled(); 
    });
});