/* global navigator */
/* global google */
'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

function directive($rootScope, MapsLoader, RouteService, $q, $timeout, $window, LocationService) {

  var MOVETHRESHOLD = 0.000002;

  function mapToGoogleLatLong(location) {
    return new google.maps.LatLng(location.latitude, location.longitude);
  }

  function link($scope, $elem, attrs, ctrl) {
    var mapOptions = {
      streetViewControl: false
    };

    var center = ctrl.center ? ctrl.center : ctrl.currentLocation;
    if (center) {
      mapOptions.center = mapToGoogleLatLong(center);
    }

    ctrl.map = new google.maps.Map($elem.find('.map-instance')[0], mapOptions);

    if ('route' in attrs) {
      ctrl.directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true, preserveViewport: true});
      ctrl.directionsRenderer.setMap(ctrl.map);
    }

    var lastLocation = [0, 0];
    var watchers = [
      $scope.$watch('map.markers', function (value) {
        if (value) {
          ctrl.updateMarkers(value);
        }

      }, true),
      $scope.$watch('map.currentLocation', function (value) {
        if (value) {
          // There are some ridiculous jitters in GPS that we do not care about and shouldn't ask the
          // map to update on.
          var isMoved = (Math.abs(lastLocation[0] - value.latitude) + Math.abs(lastLocation[1] - value.longitude)) > MOVETHRESHOLD;
          if(isMoved) {
            ctrl.updateLocationMarker(value);
            lastLocation = [value.latitude, value.longitude];
          } 
        }
      }, true),
      $scope.$watch('map.fitBoundsByMarkers', function (value) {
        if (value) {
          ctrl.mapFitBounds(value);
        }
      }),
      $scope.$watch('map.route', function (value) {
        if (value) {
          ctrl.drawRoute(value.start, value.destiny, value.fitBoundsByRoute);
        }
      }, true)

    ];
    $scope.$on('$destroy', function () {
      watchers.forEach(function (watcher) {
        if (typeof watcher === 'function') {
          watcher();
        }
      });
      watchers = null;
    });
  }


  function hasMoved(old, check) {
    return (Math.abs(old.latitude - check.latitude) + Math.abs(old.longitude - check.longitude)) > MOVETHRESHOLD;
  }

  function MapController() {
    this._addedMarkers = {
      location: null,
      general: []
    };
  }

  MapController.prototype.mapFitBounds = function mapFitBounds(markers) {
    var ctrl = this;

    if (markers && markers.length) {
      var bounds = new google.maps.LatLngBounds();
      markers.forEach(function (marker) {
        bounds.extend(mapToGoogleLatLong(marker));
      });
      ctrl.map.fitBounds(bounds);
    }

  };

  MapController.prototype.addMarker = function addMarker(marker) {
    var ctrl = this;

    var iconOpt = getIconOptions(marker.icon || marker.type || 'car');

    var markerObj = new google.maps.Marker({
      map: ctrl.map,
      animation: google.maps.Animation.DROP,
      position: mapToGoogleLatLong(marker),
      icon: iconOpt
    });
    return markerObj;
  };

  MapController.prototype.addClickableMarker = function addClickableMarker(marker) {
    var ctrl = this;

    var markerObj = ctrl.addMarker(marker);

    var onMarkerTap = ctrl.onMarkerTap();
    if (typeof onMarkerTap == 'function') {

      markerObj.addListener('click', function () {
        var zoomLevel = ctrl.map.getZoom();
        if (zoomLevel >= 13) {
          onMarkerTap(marker);
        } else {
          ctrl.map.setZoom(13);
          ctrl.map.setCenter(markerObj.getPosition());
        }
      });
    }

    return markerObj;
  };

  MapController.prototype.addLocationMarker = function addLocationMarker(location) {
    var ctrl = this;

    var locationMarker = {
      icon: 'location',
      latitude: location.latitude,
      longitude: location.longitude
    };

    ctrl._addedMarkers.location = ctrl.addMarker(locationMarker);
  };

  MapController.prototype.updateLocationMarker = function updateLocationMarker(marker) {
    var ctrl = this;

    if (ctrl._addedMarkers.location) {
      ctrl._addedMarkers.location.setPosition(mapToGoogleLatLong(marker));
    } else {
      ctrl.addLocationMarker(marker);
    }
  };

  MapController.prototype.updateMarkers = function updateMarkers(newMarkers) {
    var ctrl = this;

    var oldIds = ctrl._addedMarkers.general.map(function (m) {
      return m.id;
    });
    var newIds = newMarkers.map(function (m) {
      return m.id;
    });

    var markersToUpdate = _.intersection(oldIds, newIds);
    var markersToAdd = _.difference(newIds, markersToUpdate);
    var markersToRemove = _.difference(oldIds, markersToUpdate);
    var actualMarkers = [];

    markersToUpdate.forEach(function (id) {
      var currentMarker = ctrl._addedMarkers.general.filter(function (m) {
        return m.id === id;
      })[0];

      var newMarker = newMarkers.filter(function (m) {
        return m.id === id;
      })[0];

      if(hasMoved(currentMarker, newMarker)) {
        currentMarker.markerObj.setPosition(mapToGoogleLatLong(newMarker));
      } 
      //addedMarker.markerObj.setIcon(getIconOptions(marker.icon));
      actualMarkers.push(currentMarker);
    });

    markersToAdd.forEach(function (id) {
      var marker = newMarkers.filter(function (m) {
        return m.id === id;
      })[0];

      var markerObj = ctrl.addClickableMarker(marker);

      actualMarkers.push({
        id: marker.id,
        markerObj: markerObj
      });
    });

    markersToRemove.forEach(function (id) {
      var removingMarker = ctrl._addedMarkers.general.filter(function (marker) {
        return marker.id === id;
      })[0];

      removingMarker.markerObj.setMap(null);
    });

    ctrl._addedMarkers.general = actualMarkers;
  };

  MapController.prototype.drawRouteMarkers = function drawRouteMarkers(begin, end) {
    var ctrl = this;
    if (!ctrl.beginMarker) {
      var iconOpt = getIconOptions('location');

      ctrl.beginMarker = new google.maps.Marker({
        map: ctrl.map,
        animation: google.maps.Animation.DROP,
        position: begin,
        icon: iconOpt
      });
    } else {
      ctrl.beginMarker.setPosition(begin);
    }

    if (!ctrl.endMarker) {
      iconOpt = getIconOptions('car');

      ctrl.endMarker = new google.maps.Marker({
        map: ctrl.map,
        animation: google.maps.Animation.DROP,
        position: end,
        icon: iconOpt
      });
    } else {
      ctrl.endMarker.setPosition(end);
    }
  };

  MapController.prototype.drawRoute = function drawRoute(start, destiny, fitBoundsByRoute) {
    var ctrl = this;

    RouteService.getGRoute(mapToGoogleLatLong(start), mapToGoogleLatLong(destiny),
      function (response) {

        var route = response.routes[0].legs[0];

        var beginStep = route.steps[0];
        var endStep = route.steps[route.steps.length - 1];

        ctrl.drawRouteMarkers(beginStep.start_point, endStep.end_point);

        ctrl.directionsRenderer.setDirections(response);
        if (fitBoundsByRoute) {
          ctrl.map.fitBounds(ctrl.directionsRenderer.getDirections().routes[0].bounds);
        }
      });
  };

  function getIconOptions(iconType) {
    switch (iconType) {
      case 'car':
        return {
          url: 'img/icon-active-waivecar.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'unavailable':
        return {
          url: 'img/icon-charging-waivecar.svg',
          iconRetinaUrl: 'img/charging-waivecar.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'station':
        return {
          url: 'img/icon-station.svg',
          iconRetinaUrl: 'img/icon-station.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'station-active':
        return {
          url: 'img/icon-station-active.svg',
          iconRetinaUrl: 'img/icon-station-active.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'valet-active':
        return {
          url: 'img/icon-valet-active.svg',
          iconRetinaUrl: 'img/icon-valet-active.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'valet':
        return {
          url: 'img/icon-valet.svg',
          iconRetinaUrl: 'img/icon-valet.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'homebase':
        return {
          url: 'img/icon-homebase.svg',
          iconRetinaUrl: 'img/icon-homebase.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'homebase-active':
        return {
          url: 'img/icon-homebase-active.svg',
          iconRetinaUrl: 'img/icon-homebase-active.svg',
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'location':
        return {
          url: 'img/user-location.svg',
          iconRetinaUrl: 'img/user-location.svg',
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
          origin: new google.maps.Point(0, 0)
        };
      default:
        return {
          url: 'img/user-location.svg',
          iconRetinaUrl: 'img/user-location.svg',
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
          origin: new google.maps.Point(0, 0)
        };
    }
  };

  return {
    restrict: 'E',
    template: '<div class="map-instance" ></div>',
    controller: MapController,
    controllerAs: 'map',
    scope: true,
    bindToController: {
      zoom: '@',
      control: '=?',
      center: '=',
      currentLocation: '=',
      markers: '=',
      fitBoundsByMarkers: '=',
      onMarkerTap: '&',
      route: '='
    },
    link: link
  };

}

module.exports = angular.module('Maps').directive('googleMap', [
  '$rootScope',
  'MapsLoader',
  'RouteService',
  '$q',
  '$timeout',
  '$window',
  'LocationService',
  directive
]);
