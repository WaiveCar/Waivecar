describe('Route Distance directive',function(){
    var mockEvents={
        'routeDistanceChanged':'waiveCarRouteDistanceChanged'
    };
    beforeEach(function(){
        var self=this;
        angular.module('Maps',[]);
        angular.mock.module('Maps.route');

        angular.mock.module(function($provide){
            $provide.value('mapsEvents',mockEvents);
        });
        angular.mock.inject(function(_$compile_,_$rootScope_) {
            self.$compile = _$compile_;
            self.$rootScope = _$rootScope_;
            self.scope = self.$rootScope.$new();
        });
    });

    it('Respond to the route distance and changes it scope converting it to miles',function(){
        var meters=1000;
        var digits=3;
        var str= meters*0.00062137+'';
        var milesValue=str.substring(0,str.indexOf('.')+digits);
        var element = this.$compile('<route-distance>')(this.scope);
        this.$rootScope.$broadcast(mockEvents.routeDistanceChanged,meters);
        this.$rootScope.$digest();
        expect(element.scope().value).toEqual(milesValue+" miles away");
        
    });
  
});