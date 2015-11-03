//  function RouteService($rootScope, MapsLoader, $q, $http, mapsEvents,skobblerApiCodes) {
//     this.MapsLoader = MapsLoader;
//     this.$q = $q;
//     this.$http = $http;
//     this._scope = $rootScope;
//     this.mapsEvents = mapsEvents;
//     this.skobblerApiCodes=skobblerApiCodes;
//   }
// RouteService.prototype.getUrl = function(apiKey) {
//   if (window.cordova) {
//       var url = 'http://' + apiKey + '.tor.skobbler.net/tor/RSngx/calcroute/json/18_0/en/'+apiKey;
//       return url;
//   } else {
//     return 'http://localhost:8100/skoblerCalcRoute';
//   }
// };
// RouteService.prototype.getRoute = function(pointA, pointB, profile) {
//     var self = this;
//     profile = profile || 'pedestrian';
//     return this.MapsLoader.getMap.then(function(maps) {
//       var url = self.getUrl(maps.skobbler.apiKey);
//       url += '?start=' + pointA.lat + ',' + pointA.lng;
//       url += '&dest=' + pointB.lat + ',' + pointB.lng;
//       url += '&profile=' + profile;
//       url += '&advice=yes';
//       url += '&points=yes';
//       var defered = self.$q.defer();
//       self.$http.get(url)
//       .success(function(data, status, headers, config) {
//         if(data.status.apiCode==self.skobblerApiCodes.sourceSameAsDestination){
//           data.route={duration:0};
//         }
//         self._scope.$broadcast(
//           self.mapsEvents.routeDurationChanged,
//           data.route ? data.route.duration : 0,
//           profile
//         );
//         self._scope.$broadcast(
//           self.mapsEvents.routeDistanceChanged,
//           data.route ? data.route.routelength : 0,
//           profile
//         );
//         defered.resolve(data);
//       })
//       .error(function(data, status, headers, config) {
//         defered.reject({data: data, status: status, header: headers, config: config});
//       });
//       return defered.promise;
//     });
//   };

function routeToLocationDirective(MapsLoader, $q, routeService, mapsEvents,$rootScope) {
    var self = this;
    this.drawRoute = function(L, startLocation, destinyLocation, mapInstance, scope) {
      return routeService.getRoute(startLocation.getLatLng(), destinyLocation.getLatLng())
        .then(function(result) {
          var coordinates = [];
          if (_.isUndefined(result.route) || _.isUndefined(result.route.routePoints)) {
            return;
          }
          result.route.routePoints.forEach(function(p) {
            coordinates.push([p.x, p.y]);
          })
          var lines = [
            {
              type: 'LineString',
              coordinates: coordinates
            }
          ];
          if (scope.route) {
            mapInstance.removeLayer(scope.route);
          }
          scope.route = L.geoJson(lines);
          scope.route.addTo(mapInstance);
          var unlockRangeOptions = {
            strokeOpacity: 0.0,
            fillOpacity: 0.0,
            strokeWeight:0
          };
          var radius = 25;
          mapInstance.fitBounds(scope.route.getBounds());
        });
    }
    this.reDrawRoute = function(maps, startLocation, destinyLocation, mapInstance, scope) {
      drawRoute(maps, startLocation, destinyLocation, mapInstance, scope).then(function() {
          var deviceLocation = startLocation.getLatLng();
          if (destinyLocation.getLatLng().distanceTo(deviceLocation)<=25) {
            $rootScope.$broadcast(mapsEvents.withinUnlockRadius);
          }
        });
    }
    this.link = function(scope, element, attrs, ctrl) {
      MapsLoader.getMap.then(function(maps) {
        ctrl.mapInstance.then(function(mapInstance) {
          ctrl.locationMarker.then(function(startLocation) {
            ctrl.destinyMarker.then(function(destinyLocation) {
              drawRoute(maps, startLocation, destinyLocation, mapInstance, scope).then(function() {
                scope.$on(mapsEvents.positionChanged, function(ev, positionData) {
                  startLocation.setLatLng([positionData.latitude, positionData.longitude]);
                  reDrawRoute(maps, startLocation, destinyLocation, mapInstance, scope);
                });
                scope.$on(mapsEvents.destinyOnRouteChanged, function(ev, positionData) {
                  reDrawRoute(maps, startLocation, destinyLocation, mapInstance, scope);
                });
              })
            });
          });
        });
      });
    }
    return {
      restrict: 'E',
      require: '^map',
      link: this.link
    }
  }

// function routeDurationDirective(mapsEvents) {
//   function link(scope, element, attrs, ctrl) {
//     scope.$on(mapsEvents.routeDurationChanged, function(ev, totalTime, profile) {
//         var timeInHours = 0;
//         var timeToDisplay;
//         var timeInMinutes = Math.floor(totalTime / 60);
//         if (timeInMinutes <= 0) {
//           timeToDisplay = '< 1m';
//         } else {
//           if (timeInMinutes > 60) {
//             timeInHours = Math.floor(timeInMinutes / 60);
//             timeInMinutes = timeInMinutes - timeInHours * 60;
//             if (timeInMinutes < 10) {
//               timeInMinutes = '0' + timeInMinutes;
//             }
//             if (timeInHours < 10) {
//               timeInHours = '0' + timeInHours;
//             }
//             timeToDisplay = timeInHours + 'h' + timeInMinutes + ' hours';
//           } else {
//             if (timeInMinutes < 10) {
//               timeInMinutes = '0' + timeInMinutes;
//             }
//             timeToDisplay = timeInMinutes + ' minutes';
//           }
//         }
//         scope.value = timeToDisplay;
//         if (profile == 'pedestrian') {
//           scope.value += ' walking';
//         } else {
//           scope.value += ' driving';
//         }

//       });

//   }
//   return {
//     restrict: 'E',
//     link: link,
//     scope: true,
//     template: '<span ng-bind="value"></span>'
//   }
// }
// function routeDistanceDirective(mapsEvents) {
//   function metersToMiles(meters) {
//     var digits = 3;
//     var str = meters * 0.00062137 + '';
//     return str.substring(0, str.indexOf('.') + digits);
//   }
//   function link(scope) {
//     scope.$on(mapsEvents.routeDistanceChanged, function(ev, totalDistance) {
//       scope.value = metersToMiles(totalDistance) + ' miles away';
//     });
//   }
//   return {
//     restrict: 'E',
//     link: link,
//     scope: true,
//     template: '<span ng-bind="value"></span>'
//   }
// }
function destinyLocationDirective(MapsLoader, $q, mapsEvents) {

  function link($scope, element, attrs, ctrl) {

    function setRoute() {
      console.log('display');
      MapsLoader.getMap.then(function(L) {
        ctrl.mapInstance.then(function(mapInstance) {

          var waiveCarIcon = L.icon({
            iconUrl: '/img/active-waivecar.svg',
            iconRetinaUrl: '/img/active-waivecar.svg',
            iconSize: [20, 25],
            iconAnchor: [10, 25],
            popupAnchor: [0 , 0]
          });

          if ($scope.marker) {
            $scope.marker.setLatLng([ $scope.location.latitude, $scope.location.longitude ]);
          } else {
            $scope.marker = L.marker([ $scope.location.latitude, $scope.location.longitude ], { icon: waiveCarIcon }).addTo(mapInstance);
          }
        });
      });
    };

    $scope.$watch('location', function(newValue, oldValue) {
      if (!newValue || newValue === oldValue) {
        return;
      }
      setRoute();

    }, true);

    if ($scope.location) setRoute();
  };

  return {
    restrict : 'E',
    link     : link,
    require  : '^map',
    scope    : {
      location : '='
    }
  }
}

function routeInformationDirective() {
  return {
    templateUrl: 'modules/maps/templates/route-information.html'
  }

}
function mapsInfoDirective(MapsLoader) {
    return {
      restrict: 'E',
      template: '<h1>E</h1>'
    }
  }
angular.module('Maps.route', ['Maps'])
.constant('skobblerApiCodes',{
  'sourceSameAsDestination':'680'
})
.service('routeService', ['$rootScope', 'MapsLoader', '$q', '$http', 'mapsEvents','skobblerApiCodes', RouteService])

.directive('routeDistance', ['mapsEvents', routeDistanceDirective])
.directive('routeDuration', ['mapsEvents', routeDurationDirective])

.directive('routeInformation', routeInformationDirective)
.directive('destinyLocation', ['MapsLoader', '$q', 'mapsEvents', destinyLocationDirective])
.directive('routeToLocation', ['MapsLoader', '$q', 'routeService', 'mapsEvents','$rootScope', routeToLocationDirective])
