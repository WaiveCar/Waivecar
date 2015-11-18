'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

module.exports = angular.module('Maps').directive('map', [
  'MapsLoader',
  '$timeout',
  '$rootScope',
  'MockLocationService',
  function(MapsLoader, $timeout, $rootScope, LocationService) {

    function link($scope, $element, $attrs, MapCtrl) {

      LocationService.getLocation()
        .then(function(currentLocation){

          var center = $scope.center ? [$scope.center.latitude, $scope.center.longitude] : [currentLocation.latitude, currentLocation.longitude];

          MapCtrl.leaflet = MapsLoader.leaflet;

          var mapOptions = {
            center: center,
            apiKey: MapCtrl.leaflet.skobbler.apiKey,
            zoom: parseInt($scope.zoom, 10),
            tap: true,
            trackResize: false,
            dragging: true
          };

          if (ionic.Platform.isWebView()) {
            mapOptions.zoomControl = false;
          }

          MapCtrl.map = MapCtrl.leaflet.skobbler.map($element[0].firstChild, mapOptions);
          $scope.$broadcast('map-ready');

          // $scope.$watch('center', function() {
          //   if (!$scope.center || !$scope.center.latitude) {
          //     return false;
          //   }

          //   $timeout(function() {
          //     MapCtrl.map.setView([$scope.center.latitude, $scope.center.longitude]);
          //   }, 1000);
          // }, true);

        });

    }



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


    var controller = [
      function MapController() {
        var group;
        var markers = [];

        // leaflet instance is set from within the link function
        this.leaflet = null;
        // map instance is set from within the link function
        this.map = null;

        this.getIconInstance = function(iconType){
          return this.leaflet.icon(getIconOptions(iconType));
        };

        this.addMarker = function(location, options) {

          var marker = this.leaflet.marker(location, options)
            .addTo(this.map);

          markers.push(marker);

          this.fitBounds(null, 0.5);

          return marker;

        };

        this.addMarkerEventHandler = function(marker, event, handlerFn){
          marker.on(event, handlerFn);
        };

        this.fitBounds = function(bounds, padding){

          if(_.isUndefined(padding)){
            padding = 0;
          }
          padding = parseFloat(padding);
          if(_.isNaN(padding)){
            padding = 0;
          }

          group = new this.leaflet.featureGroup(markers);
          bounds = bounds || group.getBounds();

          this.map.fitBounds(bounds.pad(padding));

        };

        this.removeRoute = function(route){
          this.map.removeLayer(route);

        };

        this.addRoute = function(routeLines){
          var route = this.leaflet.geoJson(routeLines);
          route.addTo(this.map);

          this.fitBounds(route.getBounds(), 0);

          return route;

        };

        this.getDeviceMarker = function(){

        };

      }
    ];

    return {
      restrict: 'CE',
      templateUrl: '/templates/map.html',
      transclude: true,
      controller: controller,
      scope: {
        zoom: '@',
        center: '='
      },
      link: link
    };

  }
]);
