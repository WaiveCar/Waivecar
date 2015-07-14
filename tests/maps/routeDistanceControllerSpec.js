fdescribe('Route distance Controller',function(){
    
    var mockEvents={
        'routeDistanceChanged': 'waiveCarRouteDistanceChanged'
    };
    beforeEach(function(){
        var self=this;
        angular.module('app.modules.maps.main',[]);
        angular.mock.module('app.modules.maps.route');
     
        angular.mock.inject(function(_$rootScope_,_$q_,$controller){
            self.$q=_$q_;
            self.$rootScope=_$rootScope_;
            self.scope = self.$rootScope.$new();
            var controllerData={
                $scope: self.scope,
                waiveCar_routeService:{},
                mapsEvents:mockEvents
            }
           self.ctrl=$controller('waiveCar_routeDistanceController', controllerData);

        });
    });
    it('Updates it\'s value when route  distance changes',function(){
       this.$rootScope.$broadcast(mockEvents.routeDistanceChanged,100);
       this.$rootScope.$digest();
       expect(this.scope.value).toEqual('100 m');
    });
});