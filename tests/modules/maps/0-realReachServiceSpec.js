describe('Real Reach service',function(){
    /**
    * @todo move to external fixture
    */
    var mockLocation={
    };
    var mockMapsLoader={
    };
    var mockLeaflet={
        skobbler:{
            map:function(element){
            },
            apiKey:'foo'
        }
    };
    beforeEach(function(){
        L=mockLeaflet;//Global
        var self=this;
        angular.module('Maps',[]);
        angular.mock.module('Maps.realReach');
        angular.mock.module(function($provide){
            $provide.value("locationService", mockLocation);
            $provide.value("MapsLoader", mockMapsLoader);
        });
        angular.mock.inject(function(_$rootScope_,_$q_,_$httpBackend_,realReachService){
            self.$q=_$q_;
            var defered=_$q_.defer();
            defered.resolve(L);
            mockMapsLoader.getMap=defered.promise;
            mockLocation.getLocation=function(){
                var defered=self.$q.defer();
                defered.resolve({latitude:50,longitude:50});
                return defered.promise;
            }
            self.$rootScope=_$rootScope_;
            self.scope = self.$rootScope.$new();
            self.service=realReachService;
            self.$httpBackend=_$httpBackend_;
        });
    });
    
    it('Get\'s the real reach in minutes',function(done){
        var apiKey=mockLeaflet.skobbler.apiKey;
        var minutes=15;
        var transport='pedestrian';
        var url='http://localhost:8100/skoblerRealReach';
        url+='?response_type=gps';
        url+='&units=sec';
        url+='&nonReachable=0';
        url+='&range='+(minutes*60);
        url+='&transport='+transport;
        url+='&start=50,50';

        var response={'bar':'baz'}
        this.$httpBackend.expectGET(url).respond(response);
        var reachResponse=this.service.getReachInMinutes(minutes,transport);
        this.$rootScope.$digest();
        this.$httpBackend.flush();

        reachResponse.then(function(data){
            expect(data).toEqual(response);
            done();
        })
        .catch(function(){
            expect(true).toEqual(false);
        })
        this.$rootScope.$digest();
    });
});