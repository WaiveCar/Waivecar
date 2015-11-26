'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

module.exports = angular.module('Maps').directive('skobblerMap', [
  '$rootScope',
  'MapsLoader',
  'RouteService',
  '$q',
  function($rootScope, MapsLoader, RouteService, $q) {

    function getIconOptions(iconType) {
      switch (iconType) {
        case 'car':
          {
            return {
              iconUrl: 'img/active-waivecar.svg',
              iconRetinaUrl: 'img/active-waivecar.svg',
              iconSize: [20, 25],
              iconAnchor: [10, 25],
              popupAnchor: [0, 0]
            };
          }
        default:
          {
            return {
              iconUrl: 'img/user-location.svg',
              iconRetinaUrl: 'img/user-location.svg',
              iconSize: [25, 25],
              iconAnchor: [12.5, 25],
              popupAnchor: [0, 0]
            };
          }
      }
    }

    function link ($scope, $elem, attrs, ctrl) {
      var center = ctrl.center ? ctrl.center : $rootScope.currentLocation;

      var mapOptions = {
        center: [center.latitude, center.longitude],
        apiKey: ctrl.leaflet.skobbler.apiKey,
        zoom: parseInt(ctrl.zoom, 10),
        tap: true,
        trackResize: false,
        dragging: true
      };

      if (ionic.Platform.isWebView()) {
        mapOptions.zoomControl = false;
      }

      ctrl.map = ctrl.leaflet.skobbler.map($elem[0].firstChild, mapOptions);

      ctrl.setCurrentLocation(ctrl.location);
      ctrl.setCars(ctrl.cars);
      ctrl.drawRoute();
      ctrl.$$ready.resolve();
    }


    function MapController ($scope) {
      this._group = null;
      this.carMarkers = [];
      this.markers = [];
      this.leaflet = MapsLoader.leaflet;
      this.$$ready = $q.defer();
      this.$ready = this.$$ready.promise;
      this.route = null;

      $scope.$watch('cars', this.setCars.bind(this), true);
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
        icon: this.getIconInstance('device')
      });
    };

    MapController.prototype.setCars = function setCars (locations) {
      if (locations === null || typeof locations === 'undefined') {
        return;
      }
      var cars;
      if (locations.$resolved === false) {
        return;
      }
      if (Array.isArray(locations)) {
        cars = locations;
      } else if (locations.cars) {
        cars = locations.cars;
      } else {
        cars = [locations];
      }

      if (!cars.length) {
        return;
      }

      var icon = this.getIconInstance('car');

      this.carMarkers = _(cars).filter(function (car) {
        var location = car.location || car;
        return location.latitude && location.longitude;
      }).map(function(car) {
        var location = car.location || car;
        var marker = this.addMarker([location.latitude, location.longitude], {icon: icon});
        if (typeof this.onCarTap === 'function') {
          var fn = this.onCarTap;
          marker.on('mousedown', function () {
            fn()(car);
          });
        }
        return marker;
      }, this)
      .value();

      this.fitBounds();
    };

    MapController.prototype.getIconInstance = function getIconInstance (iconType){
      return this.leaflet.icon(getIconOptions(iconType));
    };

    MapController.prototype.addMarker = function addMarker (location, options) {
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
        cars: '=',
        onCarTap: '&',
        routeStart: '=',
        routeDestiny: '='
      },
      link: link
    };

  }
]);
