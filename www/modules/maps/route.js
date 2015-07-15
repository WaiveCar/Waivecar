 function RouteService($rootScope,MapsLoader,$q,$http,mapsEvents){
    this.MapsLoader=MapsLoader;
    this.$q=$q;
    this.$http=$http;
    this._scope=$rootScope;
    this.mapsEvents=mapsEvents;
  }

  RouteService.prototype.getRoute = function(pointA,pointB,profile) {
    var self=this;
    profile=profile || 'pedestrian';
    return this.MapsLoader.getMap.then(function(maps){
      var url="http://"+maps.skobbler.apiKey+".tor.skobbler.net/tor/RSngx/calcroute/json/18_0/en/"+maps.skobbler.apiKey;
      url+='?start='+pointA.lat+","+pointA.lng;
      url+='&dest='+pointB.lat+","+pointB.lng;
      url+='&profile='+profile;
      url+='&advice=yes';
      url+='&points=yes';
      var defered=self.$q.defer();
      self.$http.get(url)
      .success(function(data, status, headers, config) {
        self._scope.$broadcast(self.mapsEvents.routeDurationChanged,data.route.duration,profile);
        self._scope.$broadcast(self.mapsEvents.routeDistanceChanged,data.route.routelength,profile);
        defered.resolve(data);
      })
      .error(function(data, status, headers, config) {
        defered.reject({data:data,status:status,header:headers,config:config});
      });
      return defered.promise;
    });
  };

function routeToCarDirective(MapsLoader,$q,routeService,mapsEvents){
    var self=this;
    this.drawRoute=function(L,startLocation,destinyLocation,mapInstance,scope){
      return routeService.getRoute(startLocation.getLatLng(),destinyLocation.getLatLng())
        .then(function(result){
          var coordinates=[];
          result.route.routePoints.forEach(function(p){
            coordinates.push([p.x,p.y]);
          })
          var lines=[
            {
              "type": "LineString",
              "coordinates":coordinates
            }
          ];
          if(scope.route){
            mapInstance.removeLayer(scope.route);
          }
          scope.route=L.geoJson(lines);
          scope.route.addTo(mapInstance);
          var unlockRangeOptions = {
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35,
          };
          var radius=25;
          scope.unlockRadius=L.circle(destinyLocation.getLatLng(),radius,unlockRangeOptions).addTo(mapInstance);
          mapInstance.fitBounds(scope.route.getBounds());
        });
    }
    this.reDrawRoute=function(maps,startLocation,destinyLocation,mapInstance,scope){
        drawRoute(maps,startLocation,destinyLocation,mapInstance,scope).then(function(){
          var deviceLocation=startLocation.getLatLng();
          if(scope.unlockRadius.getBounds().contains(deviceLocation)){
              alert("Car unlock");
          }
        });
    }
    this.link=function(scope, element, attrs,ctrl) {
      MapsLoader.getMap.then(function(maps){
        ctrl.mapInstance.then(function(mapInstance){
          ctrl.locationMarker.then(function(startLocation){
            ctrl.destinyMarker.then(function(destinyLocation){
              drawRoute(maps,startLocation,destinyLocation,mapInstance,scope).then(function(){
                scope.$on(mapsEvents.positionChanged,function(ev,positionData){
                    startLocation.setLatLng([positionData.latitude,positionData.longitude]);
                    reDrawRoute(maps,startLocation,destinyLocation,mapInstance,scope);
                });
                scope.$on(mapsEvents.destinyOnRouteChanged,function(ev,positionData){
                    reDrawRoute(maps,startLocation,destinyLocation,mapInstance,scope);
                });
              })
            });
          });
        });
      });
    }
    return {
      restrict:'E',
      require:'^map',
      link:link
    }
  }

function routeDurationDirective(mapsEvents){
  function link(scope,element,attrs,ctrl){
      scope.$on(mapsEvents.routeDurationChanged, function(ev,totalTime,profile) {
        var timeInHours=0;
        var timeToDisplay;
        var timeInMinutes=Math.floor(totalTime/60);
        if(timeInMinutes<=0){
          timeToDisplay='< 1m';
        }
        else{
          if(timeInMinutes>60){
            timeInHours=Math.floor(timeInMinutes/60);
            timeInMinutes=timeInMinutes-timeInHours*60;
            if(timeInMinutes<10){
              timeInMinutes='0'+timeInMinutes;
            }
            if(timeInHours<10){
              timeInHours='0'+timeInHours;
            }
            timeToDisplay=timeInHours+'h'+timeInMinutes+' hours';
          }
          else{
           if(timeInMinutes<10){
              timeInMinutes='0'+timeInMinutes;
            }
            timeToDisplay=timeInMinutes+' minutes';
          }
        }
        scope.value=timeToDisplay;
        if(profile=='pedestrian'){
          scope.value+=' walking';
        }
        else{
          scope.value+=' driving';
        }

      });

  }
  return {
      restrict:'E',
      link:link,
      scope:true,
      template:'<span ng-bind="value"></span>'
  }
}
function routeDistanceDirective(mapsEvents){
  function metersToMiles(meters){
    var digits=3;
    var str= meters*0.00062137+'';
    
    return str.substring(0,str.indexOf('.')+digits);
  }
  function link(scope){
    scope.$on(mapsEvents.routeDistanceChanged, function(ev,totalDistance) {
      scope.value=metersToMiles(totalDistance)+" miles away";
    });
  }
  return {
      restrict:'E',
      link:link,
      scope:true,
      template:'<span ng-bind="value"></span>'
  }
}
function destinyLocationDirective(MapsLoader,$q,mapsEvents){
      function link(scope,element,attrs,ctrl){
        MapsLoader.getMap.then(function(L){
              ctrl.mapInstance.then(function(mapInstance){
                
                var waiveCarIcon = L.icon({
                    iconUrl: 'img/waivecar-mark.svg',
                    iconRetinaUrl: 'img/waivecar-mark.svg',
                    iconSize: [25, 25],
                    iconAnchor: [12.5, 25],
                    popupAnchor: [0 , 0]
                });
                function handleMarker(destiny){
                  if(typeof scope.marker !='undefined'){
                    scope.marker.setLatLng([destiny.latitude,destiny.longitude]);
                  }
                  else{
                    scope.marker=L.marker([destiny.latitude,destiny.longitude],{icon:waiveCarIcon}).addTo(mapInstance);
                
                    ctrl.solveDestiny(scope.marker);
                  }
                }
                var initialDestiny=scope.getInitialDestiny();
                if(!initialDestiny){
                  return;
                }
                scope.$on(mapsEvents.destinyOnRouteChanged,function(ev,destiny){
                  handleMarker(destiny);
                });
                handleMarker(initialDestiny);
              
            });
          });
      }
      return {
        restrict:'E',
        link:link,
        require:'^map',
        scope:{
          getInitialDestiny:'&'
        }

      }
}

function routeInformationDirective(){
  return {
    templateUrl:'modules/maps/templates/routeInformation.html'
  }

}
function mapsInfoDirective(MapsLoader){
    return {
      restrict:'E',
      template:'<h1>E</h1>'
    }
  }
angular.module('Maps.route', ['Maps'])
.service('routeService',['$rootScope','MapsLoader','$q','$http','mapsEvents',RouteService])

.directive('routeDistance',['mapsEvents',routeDistanceDirective])
.directive('routeDuration',['mapsEvents',routeDurationDirective])

.directive('routeInformation',routeInformationDirective)
.directive('destinyLocation',['MapsLoader','$q','mapsEvents',destinyLocationDirective])
.directive('routeToCar',['MapsLoader','$q','routeService','mapsEvents',routeToCarDirective])