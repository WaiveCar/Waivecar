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
    }
  }

  function MapController ($scope) {
    this._group = null;
    this.markers = [];
    this.leaflet = MapsLoader.leaflet;
    this.$$ready = $q.defer();
    this.$ready = this.$$ready.promise;
    this.route = null;

    if (!this.center && $rootScope.currentLocation) {
        this.center = [$rootScope.currentLocation.latitude, $rootScope.currentLocation.longitude];
    }

    $scope.$watch('markers', this.setMarkers.bind(this), true);
    $scope.$watch('location', this.setCurrentLocation.bind(this), true);
    $scope.$watch('routeStart', this.drawRoute.bind(this), true);
    $scope.$watch('routeDestiny', this.drawRoute.bind(this), true);

    // map instance is set from within the link function
    this.map = null;
  }

  MapController.prototype.setCurrentLocation = function setCurrentLocation (location) {
    if (!(location && location.latitude && location.longitude)) {
      return;
    }
    if (this.locationMarker) {
      this.locationMarker.setLatLng([location.latitude, location.longitude]);
      return;
    }
    this.locationMarker = this.addMarker([location.latitude, location.longitude], {
      icon: getIconInstance(this.leaflet, 'device')
    });
  };

  MapController.prototype.setMarkers = function setMarkers (locations) {
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

    var icon = getIconInstance(this.leaflet, this.markerIcon || 'car');

    _(markers).filter(function (marker) {
      var location = marker.location || marker;
      return location.latitude && location.longitude;
    }).map(function (mark) {
      var location = mark.location || mark;
      var marker = this.addMarker([location.latitude, location.longitude], {icon: icon});
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

  MapController.prototype.addMarker = function addMarker (location, options) {
    if (!(this.map)) {
      console.error('Bailing out of setting marker: Map not initialized');
      return null;
    }
    if (!location) {
      console.error('Bailing out of setting marker: Malformed location ', location);
      return null;
    }

    var marker = this.leaflet
      .marker(location, options)
      .addTo(this.map);

    this.markers.push(marker);
    this.fitBounds(null, 0.5);

    return marker;
  };

  MapController.prototype.fitBounds = function fitBounds (bounds, padding){
    padding = padding || 0;
    padding = parseFloat(padding);
    if(_.isNaN(padding)){
      padding = 0;
    }

    this._group = new this.leaflet.featureGroup(this.markers);
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
    controller: ['$scope', MapController],
    controllerAs: 'map',
    scope: true,
    bindToController: {
      zoom: '@',
      center: '=',
      location: '=',
      markers: '=',
      onMarkerTap: '&',
      markerIcon: '@',
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
