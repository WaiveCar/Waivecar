describe('Route duration Controller',function(){
    
    var mockEvents={
        'routeDurationChanged': 'waiveCarRouteDurationChanged',
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
           self.ctrl=$controller('waiveCar_routeDurationController', controllerData);

        });
    });
    it('Updates it\'s value when route changes',function(){
       this.$rootScope.$broadcast(mockEvents.routeDurationChanged,60);
       this.$rootScope.$digest();
       expect(this.scope.value).toEqual('00h01');
    });
    it('Convert to hours keeping the remaining minutes ',function(){
        this.$rootScope.$broadcast(mockEvents.routeDurationChanged,3660);
       this.$rootScope.$digest();
       expect(this.scope.value).toEqual('01h01');
    }); 
    it('Shows "< 1m" if duration is less than one minute',function(){
        this.$rootScope.$broadcast(mockEvents.routeDurationChanged,50);
        this.$rootScope.$digest();
        expect(this.scope.value).toEqual('< 1m');
    });

    
});