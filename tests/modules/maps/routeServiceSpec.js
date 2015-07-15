describe('Route service',function(){
  
    var mockEvents={
        'routeDurationChanged': 'waiveCarRouteDurationChanged',
        'routeDistanceChanged': 'waiveCarRouteDistanceChanged'
    };
    var mockLeaflet={
        skobbler:{
            map:function(element){
            },
            apiKey:'foo'
        }
    };
    var mockMapsLoader={
    };
    beforeEach(function(){
        L=mockLeaflet;//Global
        var self=this;
        angular.module('Maps',[]);
        angular.mock.module('Maps.route');
        angular.mock.module(function($provide){
            $provide.value("MapsLoader", mockMapsLoader);
            $provide.constant("mapsEvents", mockEvents);

        });
        angular.mock.inject(function(_$rootScope_,_$q_,_$httpBackend_,routeService,$injector){
            self.$q=_$q_;
            var defered=_$q_.defer();
            defered.resolve(L);
            mockMapsLoader.getMap=defered.promise;
            self.$rootScope=_$rootScope_;
            self.scope = self.$rootScope.$new();
            self.service=routeService;
            self.$httpBackend=_$httpBackend_;

            mockMapsLoader.getMap=defered.promise;
        });
    });
    it('Gets the route upon request and update the events when the data changes',function(done){
        spyOn(this.$rootScope, '$broadcast');
        var apiKey=mockLeaflet.skobbler.apiKey;
        var url="http://"+apiKey+".tor.skobbler.net/tor/RSngx/calcroute/json/18_0/en/"+apiKey;
        url+='?start=50,50';
        url+='&dest=100,100';
        url+='&profile=pedestrian';
        url+='&advice=yes';
        url+='&points=yes';
        var response={
            route:{
                duration:10,
                routelength:300
            }
        };
        this.$httpBackend.expectGET(url).respond(response);
        var routeResponse=this.service.getRoute({lat:50,lng:50},{lat:100,lng:100});
        this.$rootScope.$digest();
        this.$httpBackend.flush();
        var self=this;
        routeResponse.then(function(data){
            expect(data).toEqual(response);
            mockEvents.routeDurationChanged

            expect(self.scope.$broadcast)
                .toHaveBeenCalledWith(mockEvents.routeDurationChanged,response.route.duration,'pedestrian');
            expect(self.scope.$broadcast)
                .toHaveBeenCalledWith(mockEvents.routeDistanceChanged,response.route.routelength,'pedestrian');

            done();
        })
        .catch(function(){
            expect(true).toEqual(false);
        })
        this.$rootScope.$digest();
    });
    
});