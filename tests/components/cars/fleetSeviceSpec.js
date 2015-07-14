xdescribe('Fleet service',function(){
    /**
    * @todo move to external fixture
    */
    var mockResponseData={
        "object": "list",
        "has_more": false,
        "pageCount": 1,
        "itemCount": 2,
        "data": [
            {
                "stateUpdatedAt": "2015-06-29T14 :40:26.000Z",
                "createdAt": "2015-06-29T14:40:26.000Z",
                "updatedAt": "2015-06-29T15:42:13.906Z",
                "vin": "1G1PJ5SC9C7000004",
                "make": "Chevrolet",
                "model": "Sierra Extended Cab",
                "year": 2014,
                "manufacturer": "General Motors",
                "phone": "+13135470004",
                "unitType": "EMBEDDED",
                "onstarStatus": "ACTIVE",
                "primaryDriverId": "450984732",
                "primaryDriverURL": "https://developer.gm.com/api/v1/account/subscribers/450984732",
                "url": "https://developer.gm.com/api /v1/account/vehicles/1G1PJ5SC9C7000004",
                "state": "available",
                "id": "559158da30eb63961614db84"
            },
            {
                "stateUpdatedAt": "2015-06-29T14:40:26.000Z",
                "createdAt": "2015-06-29T14:40:26.000Z",
                "updatedAt": "2015-06-29T15:42:13.905Z",
                "vin": "1G1JE6SH2C4000007",
                "make": "Chevrolet",
                "model": "Yukon",
                "year": 2015,
                "manufacturer": "General Motors",
                "phone": "+13136140007",
                "unitType": "EMBEDDED",
                "onstarStatus": "ACTIVE",
                "primaryDriverId": "548392002",
                "primaryDriverURL": "https://developer.gm.com/api/v1/account/subscribers/548392002",
                "url": "https://developer.gm.com/api /v1/account/vehicles/1G1JE6SH2C4000007",
                "state": "available",
                "id": "559158da30eb63961614db87"
            }
        ]
    };
    beforeEach(function(){
        var self=this;
        var mockLocation={
            getLocation:function(){
                var defered=self.$q.defer();
                defered.resolve({latitude:50,longitude:50});
                return defered.promise;
            }
        };
        var mockConfig=function(){
            return {
                uri: {
                     api: 'v1',
                },
                models:{
                    vehicles:{
                        route:'/vehicles'
                    }   
                }
            }
        }
        timeoutTime=0;
        angular.mock.module(function($provide){
            $provide.value("waiveCar_locationService", mockLocation);
            $provide.value("$config", mockConfig);  
          
          
        });
        angular.module('app.services',[]);
        angular.module('app.modules.maps.main',[])
        .constant('mapsEvents', {
        });
        angular.mock.module('app.modules.maps.fleet');
        
        angular.mock.inject(function(_$rootScope_,_$q_,_$httpBackend_,mapsEvents,_$interval_,waiveCar_fleetService){
           self.$q=_$q_;
           self.$rootScope=_$rootScope_;
           self.scope = self.$rootScope.$new();
           self.events=mapsEvents;
           self.service=waiveCar_fleetService;
           self.$httpBackend=_$httpBackend_;
           self.$interval=_$interval_;
        });
    });
    //skipping until i can simulate a timeout
    xit('Return an empty array if the time\'s out',function(done){
        timeoutTime=1200;
        $httpBackend.expectPOST(
            'v1/vehicles/getAvailableVehiclesNearby',
            function(data){
                return true;
            }
        )
        .respond(mockResponseData);
        var response=service.getNearbyFleet(10);
        $rootScope.$digest();
        $interval.flush(timeoutTime);
        $httpBackend.flush();
        response.then(function(data){
            expect(data).toEqual([]);
            done()
        })
        .catch(function(err){
            expect(true).toEqual(false);
            done();
        });
        $rootScope.$digest();
    });
    it('Get\'s the nearby fleet related to the position',function(done){
        this.$httpBackend.expectPOST(
            'v1/vehicles/getAvailableVehiclesNearby',
            '{"location":{"latitude":50,"longitude":50},"numNearby":10}'
        )
        .respond(mockResponseData);
        var response=this.service.getNearbyFleet(10);
        this.$rootScope.$digest();
        this.$httpBackend.flush();
        response.then(function(location){
            expect(location).toEqual(mockResponseData.data);
            done();
        })
        .catch(function(err){
            done(err);
        });
        this.$rootScope.$digest();
    });
});