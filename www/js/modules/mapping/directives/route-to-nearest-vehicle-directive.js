angular.module('app.modules.mapping.directives').directive('routeToNearestVehicle', [
  '$q',
  'mappingLoader',
  '$mapRoute',
  function($q, mappingLoader, $mapRoute) {
    'use strict';

    function drawRoute(gMaps, startLocation, destinyLocation, mapInstance, scope) {
      return $mapRoute.getRoute(startLocation.getPosition(), destinyLocation.getPosition()).then(function(result) {
        scope.directionsDisplay.setMap(null);
        scope.directionsDisplay.setDirections(result);
        scope.directionsDisplay.setMap(mapInstance);
        //Draw a radius around the destiny location
        var unlockRangeOptions = {
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          map: mapInstance,
          center: destinyLocation.getPosition(),
          radius: 25
        };

        if (scope.unlockRadius) {
          scope.unlockRadius.setMap(null);
        }

        scope.unlockRadius = new gMaps.Circle(unlockRangeOptions);
      });
    }

    function mockWalking(gMaps, startLocation, destinyLocation, mapInstance, scope) {
      gMaps.event.addListener(startLocation, 'dragend', function(event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        drawRoute(gMaps, startLocation, destinyLocation, mapInstance, scope).then(function() {
          var deviceLocation = startLocation.getPosition();
          mapInstance.panTo(deviceLocation);
          //Check if devicelocation is within unlock radius
          if(scope.unlockRadius.getBounds().contains(deviceLocation) && gMaps.geometry.spherical.computeDistanceBetween(scope.unlockRadius.getCenter(), deviceLocation) <= scope.unlockRadius.getRadius()) {
            alert("Can unlock");
          }
        });
      });
    }

    function link(scope, element, attrs,ctrl) {
      mappingLoader.getMap.then(function(maps){
        scope.directionsDisplay = new maps.DirectionsRenderer({ suppressMarkers: true });
        ctrl.mapInstance.then(function(mapInstance) {
          ctrl.locationMarker.then(function(startLocation) {
            ctrl.destinyMarker.then(function(destinyLocation) {
              drawRoute(maps,startLocation,destinyLocation,mapInstance,scope).then(function() {
                mockWalking(maps,startLocation,destinyLocation,mapInstance,scope);
              });
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

]);
