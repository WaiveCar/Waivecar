describe('Destiny location directive',function(){
    var mockEvents={
        'destinyOnRouteChanged':'waiveCarDestinyOnRouteChanged'
    };
    var mockId=0;
    var mockMapsLoader={id:++mockId};
    var mockMapInstance={id:++mockId};
    var mockDestiny={latitude:50,longitude:50};
    var mocker={
        getInitialDestiny:function(){
            return mockDestiny;
        },
        solveDestiny:jasmine.createSpy('solveDestiny'),
        addToMap:jasmine.createSpy('addToMap'),
        setLatLng:jasmine.createSpy('setLatLng')
         
    }
    var mockMarker={
        addTo:function(map){
            mocker.addToMap(map);
            return this;
        },
        setLatLng:mocker.setLatLng
    };

    var mockLeaflet={
        icon:function(){
            return {};
        },
        marker:function(){
            return mockMarker;
        }
    };
    var mockMapsLoader={
    };
    var mockMapsController=function($scope){
    }
    mockMapsController.prototype.solveDestiny = mocker.solveDestiny;

    var mockController=function($scope){
    }
    mockController.prototype.getInitialDestiny = function(destiny){
        return mocker.getInitialDestiny(destiny);
    }
    
    beforeEach(function(){
        var self=this;
        angular.mock.module('Maps.route',function($provide,$controllerProvider,$compileProvider){
            $provide.provider("$state", function() {
                this.$get = function() {
                }                                                                                                                                                       
            });     
            self.$compileProvider=$compileProvider;
            $provide.value("MapsLoader", mockMapsLoader);
            $provide.value('mapsEvents',mockEvents);
            self.$compileProvider.directive('map', function() {
                return {
                    restrict:'E',
                    template:'<div ng-transclude></div>',
                    controllerAs:'mapController',
                    controller:mockMapsController,
                    transclude: true
                };
            });
            $controllerProvider.register('MockController',mockController);
        });
        angular.mock.inject(function(_$compile_,$rootScope,_$q_) {
            self.$compile = _$compile_;
            self.$rootScope = $rootScope;
            self.$q = _$q_;
            self.scope = $rootScope.$new();
            var defered = self.$q.defer();
            defered.resolve(mockLeaflet);
            mockMapsLoader.getMap = defered.promise;

            defered=self.$q.defer();
            defered.resolve(mockMapInstance);
            mockMapsController.prototype.mapInstance=defered.promise;
        });
    });
    it('Solves the destiny when it get\'s  it from the passed function',function(){
        spyOn(mocker,'getInitialDestiny').and.callThrough();

        var element = this.$compile('<div ng-controller="MockController as ctrl"><map><destiny-location get-initial-destiny="ctrl.getInitialDestiny()" ></destiny-location></map></div>')(this.scope);
        this.$rootScope.$digest();

        expect(mocker.getInitialDestiny).toHaveBeenCalled();
        expect(mocker.solveDestiny).toHaveBeenCalledWith(mockMarker);
        expect(mocker.addToMap).toHaveBeenCalledWith(mockMapInstance);
    });
    it('After rendering continues to listening for the destiny changes',function(){

        var element = this.$compile('<div ng-controller="MockController as ctrl"><map><destiny-location get-initial-destiny="ctrl.getInitialDestiny()" ></destiny-location></map></div>')(this.scope);
        this.$rootScope.$digest();
        var newDestiny={latitude:101,longitude:102};
        this.$rootScope.$broadcast(mockEvents.destinyOnRouteChanged,newDestiny);
        expect(mocker.setLatLng).toHaveBeenCalledWith([newDestiny.latitude,newDestiny.longitude]);
    })
});