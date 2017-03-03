/* global navigator */
/* global google */
'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

function directive ($rootScope, MapsLoader, RouteService, $q, $timeout, $window, LocationService) {


  function mapToGoogleLatLong(location) {
    return new google.maps.LatLng(location.latitude, location.longitude);
  }

  function link ($scope, $elem, attrs, ctrl) {



    //var center = ctrl.center ? ctrl.center :  ctrl.currentLocation;

    var mapOptions = {
      //zoom: 15,
      //center: mapToGoogleLatLong(center)
    };

    ctrl.map = new google.maps.Map($elem.find('.map-instance')[0], mapOptions);

    if (ctrl.markers) {
      ctrl.updateMarkers(ctrl.markers);
    }

    if (ctrl.currentLocation) {
      ctrl.addLocationMarker(ctrl.currentLocation);
    }

    ctrl.control = ctrl.control || {};

    //ctrl.control.fitBounds = function() {
      ctrl.mapFitBounds(ctrl.markers, ctrl.featured, ctrl.currentLocation);
    //}


    var watchers = [
      $scope.$watch('map.markers', function (value, oldValue) {
        if (value) {
          ctrl.updateMarkers(value);
        }

        // first time initialization
        if (!oldValue && value) {
          ctrl.mapFitBounds(value, ctrl.featured, ctrl.currentLocation);
        }

      }, true),
      $scope.$watch('map.currentLocation', function (value, oldValue) {
        if (oldValue && value) {
          ctrl.updateLocationMarker(value);
        }

        if (!oldValue && value) {
          ctrl.addLocationMarker(ctrl.currentLocation);
          ctrl.mapFitBounds(ctrl.markers, ctrl.featured, value);
        }
      }, true),
      $scope.$watch('map.featured', function (value, oldValue) {

        if (!oldValue && value) {
          ctrl.mapFitBounds(ctrl.markers, value, ctrl.currentLocation);
        }
      }, true)
      //$scope.$watch('map.routeStart', ctrl.drawRoute.bind(ctrl), true),
      //$scope.$watch('map.routeDestiny', ctrl.drawRoute.bind(ctrl), true),

    ];
    $scope.$on('$destroy', function () {
      console.log('Destroying watchers');
      watchers.forEach(function (watcher) {
        if (typeof watcher === 'function') {
          watcher();
        }
      });
      watchers = null;
    });


  }


  function MapController () {
    this._addedMarkers = {
      location: null,
      general: []
    };

  }


  MapController.prototype.mapFitBounds = function mapFitBounds(markers, featured, currentLocation) {
    var ctrl = this;


    var fitBounedsMarkers = [];
    if (Array.isArray(featured) && featured.length) {
      fitBounedsMarkers = featured.slice();

      if (currentLocation) {
        fitBounedsMarkers.push(currentLocation);
      }
    } else {
      fitBounedsMarkers = markers.slice();
    }

    if (fitBounedsMarkers.length) {
      var bounds = new google.maps.LatLngBounds();
      fitBounedsMarkers.forEach(function (marker) {
        bounds.extend(mapToGoogleLatLong(marker));
      });
      ctrl.map.fitBounds(bounds);
    }

  };

  MapController.prototype.addMarker = function addMarker( marker) {

    var ctrl = this;

    var iconOpt = getIconOptions(marker.icon);

    var markerObj = new google.maps.Marker({
      map: ctrl.map,
      animation: google.maps.Animation.DROP,
      position: mapToGoogleLatLong(marker),
      icon: iconOpt
    });
    return markerObj;
  };

  MapController.prototype.addClickableMarker = function addClickableMarker( marker) {
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
    ctrl._addedMarkers.location.setPosition(mapToGoogleLatLong(marker));
  };


  MapController.prototype.updateMarkers = function updateMarkers(markers) {
    var ctrl = this;

    var oldIds = ctrl._addedMarkers.general.map(function(m) {
      return m.id;
    });
    var newIds = markers.map(function(m) {
      return m.id;
    });

    var markersToUpdate = _.intersection(oldIds, newIds);
    var markersToAdd = _.difference(newIds, markersToUpdate);
    var markersToRemove = _.difference(oldIds, markersToUpdate);
    var actualMarkers = [];


    markersToUpdate.forEach(function( id ) {
      var addedMarker = ctrl._addedMarkers.general.filter(function(m) {
        return m.id === id;
      })[0];

      var marker = markers.filter(function(m) {
        return m.id === id;
      })[0];

      addedMarker.markerObj.setPosition(mapToGoogleLatLong(marker));
      addedMarker.markerObj.setIcon(getIconOptions(marker.icon));
      actualMarkers.push(addedMarker);
    });

    markersToAdd.forEach(function( id ) {
      var marker = markers.filter(function(m) {
        return m.id === id;
      })[0];

      var markerObj = ctrl.addClickableMarker(marker);

      actualMarkers.push({
        id: marker.id,
        markerObj: markerObj
      });
    });

    markersToRemove.forEach(function( id ) {
      var removingMarker = ctrl._addedMarkers.general.filter(function(marker) {
        return marker.id === id;
      })[0];

      removingMarker.markerObj.setMap(null);
    });

    ctrl._addedMarkers.general = actualMarkers;
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
      featured: '=',
      onMarkerTap: '&',
      routeStart: '=',
      routeDestiny: '='
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
