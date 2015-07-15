describe('Route duration directive',function(){
    var mockEvents={
        'routeDurationChanged':'waiveCarRouteDurationChanged'
    };
    var profile='pedestrian';
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

    it('Responds to the route duration and format it for hours',function(){
        var element = this.$compile('<route-duration>')(this.scope);
        var timeInHours=1;
        var timeInMinutes=30;
        this.$rootScope.$broadcast(mockEvents.routeDurationChanged,timeInHours*3600+timeInMinutes*60,profile);
        this.$rootScope.$digest();
        expect(element.scope().value).toEqual('0'+timeInHours+'h'+timeInMinutes+' hours walking');
        
    });
  it('Responds to the route duration and format it for minutes',function(){
        var element = this.$compile('<route-duration>')(this.scope);
        var timeInMinutes=5;
        this.$rootScope.$broadcast(mockEvents.routeDurationChanged,timeInMinutes*60,profile);
        this.$rootScope.$digest();
        expect(element.scope().value).toEqual('0'+timeInMinutes+' minutes walking');


  });
  it('Responds to the route duration and format it for seconds',function(){
    var element = this.$compile('<route-duration>')(this.scope);
    this.$rootScope.$broadcast(mockEvents.routeDurationChanged,59,profile);
    this.$rootScope.$digest();
    expect(element.scope().value).toEqual('< 1m walking');
  });

});