+
(function() {
    var TIMEOUT_REQUEST=1000;
    function FleetService($rootScope,$q,locationService,$http,config){
        this.$q=$q;
        this.locationService=locationService;
        this.$http=$http;
        this.$rootScope=$rootScope;
        this.url=config.uri.vehicles.getNearby;
    }
    FleetService.prototype.getNearbyFleet = function(numNearby) {
        var self=this;
        return this.locationService.getLocation().then(
            function(deviceLocation){ 
                var ret=[];
                numNearby=numNearby || 10;
                var maxDiff=0.005;
                var minDiff=0.0005;
                for(var i=0;i<numNearby;i++){
                    var diffA=Math.random() * (maxDiff - minDiff) + minDiff;
                    var diffB=Math.random() * (maxDiff - minDiff) + minDiff
                    if(Math.random()<.5){
                        diffA=diffA*-1;
                    }
                    if(Math.random()<.5){
                        diffB=diffB*-1;
                    }
                    ret.push(
                        {
                            latitude:deviceLocation.latitude+diffA,
                            longitude:deviceLocation.longitude+diffB,
                            status:{
                                charge:{
                                    current:69,
                                    timeUntilFull:20,
                                    reach:10,
                                    charging:true
                                },
                            },
                            name:'Chevrolet Spark',
                            plate:'AUD 568'
                        }
                    )
                }
                return ret;
                //HOlding until new API is up
                // var defered=self.$q.defer();
                // var config={
                //     timeout:TIMEOUT_REQUEST,
                //     method:"POST",
                //     data:{location:deviceLocation,numNearby:numNearby},
                //     url:self.url
                // }
                // var startTime = new Date().getTime();
                // self.$http(config)
                // .success(function(response, status, headers, config) {
                //     defered.resolve(response.data)
                // })
                // .error(function(response, status, headers, config) {
                //     var respTime = new Date().getTime() - startTime;
                //     if(respTime >= TIMEOUT_REQUEST){
                //         defered.resolve([]);
                //     }
                //     else{
                //         defered.reject({response:response,status:status,headers:headers});
                //     }
                // });
                // return defered.promise;
            }
        );
}
function nearbyFleetDirective(MapsLoader,$q,fleetService,realReachService,$window){
    function addMarkerClick(marker,info,onClickFn){
      marker.on('mousedown', function(e) {
        onClickFn({marker:marker,info:info});
    });
  }
  
  function link(scope, element, attrs,ctrl) {
      fleetService.getNearbyFleet().then(function(fleet){ 
        MapsLoader.getMap.then(function(L){
          ctrl.mapInstance.then(function(mapInstance){

            var waiveCarIcon = L.icon({
                iconUrl: 'img/waivecar-mark.svg',
                iconRetinaUrl: 'img/waivecar-mark.svg',
                iconSize: [25, 25],
                iconAnchor: [12.5, 25],
                popupAnchor: [0 , 0]
            });

            var latLng;
            var markers=[];
            var marker;
            fleet.forEach(function(f){
                marker=L.marker([f.latitude,f.longitude],{icon:waiveCarIcon}).addTo(mapInstance);
                addMarkerClick(marker,f,scope.onClickMarker);
                markers.push(marker);
            });
            // realReachService.getReachInMinutes(15,TRANSPORT_PEDESTRIAN).then(function(reach){
            //   var numPoints=reach.realReach.gpsPoints.length;
            //   var polygonPoints=[];
            //   var latLng;
            //       //No idea why we have to skip the first 8
            //       for(var i=8; i<numPoints; i+=2){
            //         //No idea why they invert this also
            //         latLng=new L.LatLng(reach.realReach.gpsPoints[i+1], reach.realReach.gpsPoints[i]);
            //         polygonPoints.push(latLng);
            //     }
            //     var polygon = new L.Polygon(polygonPoints);
            //     mapInstance.addLayer(polygon);
            //     scope.reachPolygon=polygon;
            //     marker=L.marker(latLng,{icon:waiveCarIcon}).addTo(mapInstance);
            //     ctrl.solveDestiny(marker);
            //     addMarkerClick(marker);
            // });
         });
      });

    });
}
    return {
        restrict:'CE',
        link: link,
        require:'^map',
        scope:{
            onClickMarker: '&'
        }
    }
}
angular.module('Maps.fleet', ['Maps'])
.service('waiveCar_fleetService',['$rootScope','$q','waiveCar_locationService','$http','config',FleetService])
.directive('nearbyFleet',['waiveCar_MapsLoader','$q','waiveCar_fleetService','waiveCar_realReachService','$window',nearbyFleetDirective]);

})();