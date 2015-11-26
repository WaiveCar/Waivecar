'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

module.exports = angular.module('Maps').directive('skobblerMap', [
  'MapsLoader',
  '$q',
  function(MapsLoader, $q) {

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
      var mapOptions = {
        center: [ctrl.center.latitude, ctrl.center.longitude],
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
      ctrl.$$ready.resolve();
    }


    function MapController ($scope) {
      this._group = null;
      this.carMarkers = [];
      this.leaflet = MapsLoader.leaflet;
      this.$$ready = $q.defer();
      this.$ready = this.$$ready.promise;

      $scope.$watch('cars', this.setCars.bind(this), true);
      $scope.$watch('location', this.setCurrentLocation.bind(this), true);

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
      var cars = locations && locations.cars;
      if (!(Array.isArray(cars))) {
        return;
      }
      var icon = this.getIconInstance('car');

      this.carMarkers = _(cars).filter(function (car) {
        return car.latitude && car.longitude && car.isAvailable;
      }).map(function(car) {
        var marker = this.addMarker([car.latitude, car.longitude], {icon: icon});
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

      this.fitBounds(null, 0.5);

      return marker;

    };

    MapController.prototype.fitBounds = function fitBounds (bounds, padding){
      padding = padding || 0;
      padding = parseFloat(padding);
      if(_.isNaN(padding)){
        padding = 0;
      }

      if (this.carMarkers.length) {
        this._group = new this.leaflet.featureGroup(this.carMarkers);
      } else if (this.locationMarker) {
        this._group = new this.leaflet.featureGroup([this.locationMarker]);
      } else {
        return;
      }
      bounds = bounds || this._group.getBounds();
      this.map.fitBounds(bounds.pad(padding));

    };

    MapController.prototype.removeRoute = function removeRoute (route){
      this.map.removeLayer(route);

    };

    MapController.prototype.addRoute = function addRoute (routeLines){
      var route = this.leaflet.geoJson(routeLines);
      route.addTo(this.map);

      this.fitBounds(route.getBounds(), 0);

      return route;
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
        onCarTap: '&'
      },
      link: link
    };

  }
]);
