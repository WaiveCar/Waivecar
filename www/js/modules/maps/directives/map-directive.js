'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

function directive ($rootScope, MapsLoader, RouteService, $q) {
  function link ($scope, $elem, attrs, ctrl) {
    var mapOptions = {
      apiKey: ctrl.leaflet.skobbler.apiKey,
      zoom: parseInt(ctrl.zoom, 10),
      tap: true,
      trackResize: false,
      dragging: true
    };

    if (ionic.Platform.isWebView()) {
      mapOptions.zoomControl = false;
    }

    if (ctrl.center) {
      mapOptions.center = ctrl.center;
    }

    ctrl.map = ctrl.leaflet.skobbler.map($elem[0].firstChild, mapOptions);
    if (ctrl.map) {
      ctrl.setCurrentLocation(ctrl.location);
      ctrl.setMarkers(ctrl.markers);
      ctrl.drawRoute();
      ctrl.$$ready.resolve();
      var watchers = [];
      watchers[0] = $scope.$watch('map.markers', ctrl.setMarkers.bind(ctrl), true);
      watchers[1] = $scope.$watch('map.routeStart', ctrl.drawRoute.bind(ctrl), true);
      watchers[2] = $scope.$watch('map.routeDestiny', ctrl.drawRoute.bind(ctrl), true);
      watchers[3] = $rootScope.$watch('currentLocation', ctrl.setCurrentLocation.bind(ctrl), true);
      $scope.$on('$destroy', function () {
        console.log('Destroying watchers');
        watchers.forEach(function (watcher) {
          if (typeof watcher === 'function') {
            watcher();
          }
        });
      });
    }
  }

  function MapController () {
    this._group = null;
    this.items = {};
    this.leaflet = MapsLoader.leaflet;
    this.$$ready = $q.defer();
    this.$ready = this.$$ready.promise;
    this.route = null;

    if (!this.center && $rootScope.currentLocation) {
      this.center = [$rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude];
    } else {
      this.center = [ 34.0604643, -118.4186743 ];
    }

    // map instance is set from within the link function
    this.map = null;
  }

  MapController.prototype.setCurrentLocation = function setCurrentLocation (location) {
    if (!(location && location.latitude && location.longitude)) {
      return;
    }
    this.addMarker('location', [location.latitude, location.longitude], {
      icon: getIconInstance(this.leaflet, 'location')
    });
  };

  MapController.prototype.setMarkers = function setMarkers (locations) {
    console.log('Setting markers at ', locations);
    if (locations === null || typeof locations === 'undefined') {
      return;
    }
    var markers;
    if (locations.$resolved === false) {
      return;
    }
    if (Array.isArray(locations)) {
      markers = locations;
    } else if (locations.cars) {
      markers = locations.cars;
    } else {
      markers = [locations];
    }

    if (!markers.length) {
      return;
    }

    _(markers).filter(function (marker) {
      var location = marker.location || marker;
      return location.latitude && location.longitude;
    }).map(function (mark) {
      var location = mark.location || mark;
      var marker = this.addMarker(mark.id, [location.latitude, location.longitude], {
        icon: getIconInstance(this.leaflet, mark.icon || mark.type || 'car')
      });
      if (marker === null) {
        return null;
      }
      if (typeof this.onMarkerTap === 'function') {
        var fn = this.onMarkerTap;
        marker.on('mousedown', function () {
          fn()(mark);
        });
      }
      return marker;
    }, this)
    .value();
  };

  MapController.prototype.addMarker = function addMarker (id, location, options) {
    if (!(this.map)) {
      console.error('Bailing out of setting marker: Map not initialized');
      return null;
    }
    if (!location) {
      console.error('Bailing out of setting marker: Malformed location ', location);
      return null;
    }

    if (this.items[id]) {
      this.items[id].setLatLng(location).update();
      // return null when no new marker is added to avoid setting listeners
      this.fitBounds(null, 0.5);
      return null;
    }

    var marker = this.leaflet
      .marker(location, options)
      .addTo(this.map);

    this.items[id] = marker;
    this.fitBounds(null, 0.5);

    return marker;
  };

  MapController.prototype.fitBounds = function fitBounds (bounds, padding){
    padding = padding || 0;
    padding = parseFloat(padding);
    if(_.isNaN(padding)){
      padding = 0;
    }

    this._group = new this.leaflet.featureGroup(_.values(this.items));
    bounds = bounds || this._group.getBounds();
    this.map.fitBounds(bounds.pad(padding));
  };

  MapController.prototype.drawRoute = function () {
    if (!(this.routeStart && this.routeDestiny)) {
      return;
    }
    RouteService.getRoute(this.routeStart, this.routeDestiny)
    .then(function (routeLines) {
      if (this.route) {
        this.map.removeLayer(this.route);
      }
      this.route = this.leaflet.geoJson(routeLines);
      this.route.addTo(this.map);

      this.fitBounds(this.route.getBounds(), 0);
    }.bind(this));
  };


  function getIconInstance (leaflet, iconType){
    return leaflet.icon(getIconOptions(iconType));
  }

  function getIconOptions(iconType) {
    switch (iconType) {
    case 'car':
      return {
        iconUrl: 'img/active-waivecar.svg',
        iconRetinaUrl: 'img/active-waivecar.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'unavailable':
      return {
        iconUrl: 'img/charging-waivecar.svg',
        iconRetinaUrl: 'img/charging-waivecar.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'station':
      return {
        iconUrl: 'img/icon-station.svg',
        iconRetinaUrl: 'img/icon-station.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'station-active':
      return {
        iconUrl: 'img/icon-station-active.svg',
        iconRetinaUrl: 'img/icon-station-active.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'valet-active':
      return {
        iconUrl: 'img/icon-valet-active.svg',
        iconRetinaUrl: 'img/icon-valet-active.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'valet':
      return {
        iconUrl: 'img/icon-valet.svg',
        iconRetinaUrl: 'img/icon-valet.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'homebase':
      return {
        iconUrl: 'img/icon-homebase.svg',
        iconRetinaUrl: 'img/icon-homebase.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'homebase-active':
      return {
        iconUrl: 'img/icon-homebase-active.svg',
        iconRetinaUrl: 'img/icon-homebase-active.svg',
        iconSize: [20, 25],
        iconAnchor: [10, 25],
        popupAnchor: [0, 0]
      };
    case 'location':
      return {
        iconUrl: 'img/user-location.svg',
        iconRetinaUrl: 'img/user-location.svg',
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, 0]
      };
    default:
      return {
        iconUrl: 'img/user-location.svg',
        iconRetinaUrl: 'img/user-location.svg',
        iconSize: [25, 25],
        iconAnchor: [12.5, 25],
        popupAnchor: [0, 0]
      };
    }
  }

  return {
    restrict: 'E',
    template: '<div class="map-instance"></div>',
    controller: MapController,
    controllerAs: 'map',
    scope: true,
    bindToController: {
      zoom: '@',
      center: '=',
      markers: '=',
      onMarkerTap: '&',
      routeStart: '=',
      routeDestiny: '='
    },
    link: link
  };

}

module.exports = angular.module('Maps').directive('skobblerMap', [
  '$rootScope',
  'MapsLoader',
  'RouteService',
  '$q',
  directive
]);
