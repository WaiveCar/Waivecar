/* global navigator */
/* global google */
'use strict';
var angular = require('angular');
var ionic = require('ionic');
// MapsLoader is an angular provider which returns leaflet instance from 'getMap' call
require('../../../providers/maps-loader-provider');
var _ = require('lodash');

function directive($rootScope, MapsLoader, RouteService, $q, $timeout, $window, LocationService, $injector) {

  var MOVETHRESHOLD = 0.000008;
  var homebase = $injector.get('homebase');

  function mapToGoogleLatLong(location) {
    return new google.maps.LatLng(location.latitude, location.longitude);
  }

  function mapToNativeLatLong(location) {
    return { lat:location.latitude, lng:location.longitude };
  }

  function mapToLatLong(location) {
    return useCordova() ? mapToNativeLatLong(location) : mapToGoogleLatLong(location);
  }

  function useCordova() {
    return !!window.plugin;
  }

  function createGMap(mapElement, center, noscroll) {

    var mapOptions;

    if (useCordova()) {

      mapOptions = {
        'mapType': plugin.google.maps.MapTypeId.ROADMAP,
        'controls': {
          'compass': false,
          'myLocationButton': false,
          'indoorPicker': false,
          'zoom': false
        },
        'camera' : {
          target: mapToNativeLatLong(center),
          zoom: 14
        },
        'preferences': {
          'zoom': {
            'minZoom': 10,
            'maxZoom': 18
          },
          'building': false
        }
      };


      return plugin.google.maps.Map.getMap(mapElement, mapOptions)
    } else {
      mapOptions = {
        streetViewControl: false,
        mapTypeControl: false,
        zoom: 14,
        fullscreenControl: false,
        center: mapToGoogleLatLong(center),
        zoomControl: false
      };

      if(noscroll) {
        mapOptions.gestureHandling = 'cooperative';
      }


      return new google.maps.Map(mapElement, mapOptions);
    }
  }



  function link($scope, $elem, attrs, ctrl) {
    var center = ctrl.center ? ctrl.center : ctrl.currentLocation;
    center = center || homebase;


    ctrl.map = createGMap( $elem.find('.map-instance')[0], center, attrs.noscroll);

    ctrl.updatesQueue = [];
    ctrl.drawRouteQueue = [];


    ctrl.invokeOnMapReady(function() {

      if (useCordova()) {
        $rootScope.$on('mainMenuStateChange', function (event, data) {
          if (data === 'open') {
            ctrl.map.setClickable(false);
          }
          if (data === 'close') {
            ctrl.map.setClickable(true);
          }
        });
      }

      if ('route' in attrs) {

        if (useCordova()) {
          ctrl.directionsRenderer = createNativeDirectionsRenderer(ctrl.map)
        } else {
          ctrl.directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true, preserveViewport: true});
          ctrl.directionsRenderer.setMap(ctrl.map);
        }
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
            //console.log('>> map draw', isMoved, (Math.abs(lastLocation[0] - value.latitude) + Math.abs(lastLocation[1] - value.longitude)));
            if (isMoved) {
              ctrl.updateLocationMarker(value);
              lastLocation = [value.latitude, value.longitude];
            }
          }
        }, true),
        $scope.$watch('map.fitBoundsByMarkers', function (value) {
          if (value) {
            ctrl.mapFitBounds(value);
          }
        }, true),
        $scope.$watch('map.route', function (value) {
          if (value && value.destiny) {
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

  MapController.prototype.invokeOnMapReady = function invokeOnMapReady(readyHandler) {
    var ctrl = this;

    if (useCordova()) {
      ctrl.map.one(plugin.google.maps.event.MAP_READY, readyHandler);
    } else {
      readyHandler();
    }
  }

  MapController.prototype.mapFitBounds = function mapFitBounds(markers) {
    var ctrl = this;

    if (markers && markers.length > 1) {

      var bounds = useCordova() ? new plugin.google.maps.LatLngBounds() : new google.maps.LatLngBounds();
      markers.forEach(function (marker) {
        bounds.extend(mapToLatLong(marker));
      });

      if (useCordova()) {
        //ctrl.map.moveCamera({target: bounds});
      } else {
        ctrl.map.fitBounds(bounds);
      }
    }

  };

  function charge2color(marker) {
    return Math.min(2, Math.floor(marker.charge / 33));
  }

  MapController.prototype.addMarker = function addMarker(marker) {

    var deferred = $q.defer();

    var type = marker.icon || marker.type;
    if('charge' in marker) {
      type = 'active-waivecar-' + charge2color(marker);
    }
    var iconOpt = getIconOptions(type, useCordova() ? '.png' : '.svg');

    if (useCordova()) {
      this.map.addMarker({
        position: mapToNativeLatLong(marker),

        icon: {
          url: './' + iconOpt.url,
          size: iconOpt.scaledSize,
          anchor: iconOpt.anchor
        }

      }, function(markerObj) {
        deferred.resolve(markerObj);
      });

    } else {

      var markerObj = new google.maps.Marker({
        map: this.map,
        animation: google.maps.Animation.DROP,
        position: mapToGoogleLatLong(marker),
        icon: iconOpt
      });

      deferred.resolve(markerObj);
    }

    return deferred.promise;
  };

  MapController.prototype.addClickableMarker = function addClickableMarker(marker) {
    var ctrl = this;

    return ctrl.addMarker(marker).then(function(markerObj) {

      var onMarkerTap = ctrl.onMarkerTap();
      if (typeof onMarkerTap == 'function') {

        var onClick = function () {
          var zoomLevel = useCordova() ? ctrl.map.getCameraZoom() : ctrl.map.getZoom();
          if (zoomLevel >= 13) {
            onMarkerTap(marker);
          } else {

            if (useCordova()) {
              ctrl.map.moveCamera({target: markerObj.getPosition(), zoom : 13});
            } else {
              ctrl.map.setZoom(13);
              ctrl.map.setCenter(markerObj.getPosition());
            }
          }
        };

        if (useCordova()) {
          markerObj.on(plugin.google.maps.event.MARKER_CLICK, onClick);
        } else {
          markerObj.addListener('click', onClick);
        }

      }
      return markerObj;
    });
  };

  MapController.prototype.addLocationMarker = function addLocationMarker(location) {
    var ctrl = this;

    var locationMarker = {
      icon: 'location',
      latitude: location.latitude,
      longitude: location.longitude
    };

     ctrl.addMarker(locationMarker).then(function(marker) {
       ctrl._addedMarkers.location = marker;
     });
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

    function onUpdateFinish() {
      ctrl.updatesQueue.shift();
      if (ctrl.updatesQueue.length > 0) {
        ctrl.unsafeUpdateMarkers(ctrl.updatesQueue[0]).then(onUpdateFinish);
      }
    }

    ctrl.updatesQueue.push(newMarkers);
    if (ctrl.updatesQueue.length === 1) {
      ctrl.unsafeUpdateMarkers(newMarkers).then(onUpdateFinish);
    }

  };

  MapController.prototype.unsafeUpdateMarkers = function unsafeUpdateMarkers(newMarkers) {
    var ctrl = this;

    newMarkers = newMarkers.filter(function(m) {
      return m.type !== 'zone';
    });

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
        currentMarker.markerObj.setPosition(mapToLatLong(newMarker));
      }
      //addedMarker.markerObj.setIcon(getIconOptions(marker.icon));
      actualMarkers.push(currentMarker);
    });

    var markersAddAllPromises = [];
    markersToAdd.forEach(function (id) {
      var marker = newMarkers.filter(function (m) {
        return m.id === id;
      })[0];

      var promise = ctrl.addClickableMarker(marker).then(function(markerObj) {
        return {
          id: marker.id,
          markerObj: markerObj
        };
      });

      markersAddAllPromises.push(promise);
    });

    return $q.all(markersAddAllPromises, $q.resolve()).then(function(newMarkersObjects) {

      newMarkersObjects.pop();

      actualMarkers = actualMarkers.concat(newMarkersObjects);


      markersToRemove.forEach(function (id) {
        var removingMarker = ctrl._addedMarkers.general.filter(function (marker) {
          return marker.id === id;
        })[0];

        removingMarker.markerObj.setMap(null);
      });

      ctrl._addedMarkers.general = actualMarkers;

    });
  };

  MapController.prototype.drawRouteMarkers = function drawRouteMarkers(begin, end) {
    var ctrl = this;

    function onUpdateFinish() {
      ctrl.drawRouteQueue.shift();
      if (ctrl.drawRouteQueue.length > 0) {
        ctrl.unsafeDrawRouteMarkers(ctrl.drawRouteQueue[0].begin, ctrl.drawRouteQueue[0].end).then(onUpdateFinish);
      }
    }

    ctrl.drawRouteQueue.push({ begin:begin, end:end});
    if (ctrl.drawRouteQueue.length === 1) {
      ctrl.unsafeDrawRouteMarkers(begin, end).then(onUpdateFinish);
    }
  };

  MapController.prototype.unsafeDrawRouteMarkers = function unsafeDrawRouteMarkers(begin, end) {
    var ctrl = this;
    var promises = {
      dumy:$q.resolve()
    };

    if (!ctrl.beginMarker) {
      promises.beginMarker = ctrl.addMarker(begin);
    } else {
      ctrl.beginMarker.setPosition(begin);
    }

    if (!ctrl.endMarker) {
      promises.endMarker = ctrl.addMarker(end);
    } else {
      ctrl.endMarker.setPosition(end);
    }

    return $q.all(promises);
  };

  MapController.prototype.drawRoute = function drawRoute(start, destiny, fitBoundsByRoute) {
    var ctrl = this;

    RouteService.getGRoute(mapToGoogleLatLong(start), mapToGoogleLatLong(destiny),
      function (response) {

        var route = response.routes[0].legs[0];

        var beginStep = route.steps[0];
        var endStep = route.steps[route.steps.length - 1];

        ctrl.drawRouteMarkers( {
          latitude: beginStep.start_point.lat(),
          longitude:  beginStep.start_point.lng(),
          type: 'location'
        }, {
          latitude: endStep.end_point.lat(),
          longitude:  endStep.end_point.lng(),
          type: destiny.type,
          charge: destiny.charge
        });

        ctrl.directionsRenderer.setDirections(response);
        if (fitBoundsByRoute) {
          var bounds = response.routes[0].bounds;

          if (useCordova()) {

            ctrl.map.moveCamera({target: new plugin.google.maps.LatLngBounds([{
              lat:bounds.getNorthEast().lat(),
              lng:bounds.getNorthEast().lng()
            }, {
              lat:bounds.getSouthWest().lat(),
              lng:bounds.getSouthWest().lng()
            }])});

          } else {
            ctrl.map.fitBounds(bounds);
          }


        }
      });
  };

  function getIconOptions(iconType, fileExt) {
    switch (iconType) {
      case 'active-waivecar':
      case 'active-waivecar-0':
      case 'active-waivecar-1':
      case 'active-waivecar-2':
      case 'station':
      case 'station-active':
      case 'valet-active':
      case 'valet':
      case 'homebase':
      case 'homebase-active':
        return {
          url: 'img/icon-' + iconType + fileExt,
          iconRetinaUrl: 'img/icon-' + iconType + fileExt,
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'unavailable':
        return {
          url: 'img/icon-charging-waivecar' + fileExt,
          iconRetinaUrl: 'img/charging-waivecar' + fileExt,
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'location':
        return {
          url: 'img/user-location' + fileExt,
          iconRetinaUrl: 'img/user-location' + fileExt,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
          origin: new google.maps.Point(0, 0)
        };
      case 'dropoff':
        return {
          url: 'img/icon-active-waivecar' + fileExt,
          scaledSize: new google.maps.Size(35, 44),
          anchor: new google.maps.Point(17, 44),
          origin: new google.maps.Point(0, 0)
        };
      case 'hub':
        return {
          url: 'img/icon-hub.' + fileExt,
          iconRetinaUrl: 'img/icon-hub.' + fileExt,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
          origin: new google.maps.Point(0, 0)
        };
      default:
        return {
          url: 'img/user-location' + fileExt,
          iconRetinaUrl: 'img/user-location' + fileExt,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
          origin: new google.maps.Point(0, 0)
        };
    }
  };

  function createNativeDirectionsRenderer(map) {

    var impl = {
      polyline: null,
    };

    console.log("Poly line map ", map);
    map.addPolyline({
      'points': [{lat: 35.548852, lng: 139.784086}, {lat: 37.615223, lng: -122.389979}],
      'color' : '#55aaFF',
      'width': 10,
      'geodesic': true
    }, function(polyline) {

      console.log("Poly line ", polyline);

      impl.polyline = polyline;
      if (impl.defferecDirections) {
        setPolylinePointsFromDirections(impl.defferecDirections);
        impl.defferecDirections = null;
      }
    });

    function setPolylinePointsFromDirections(directions) {
      var route = directions.routes[0].legs[0];
      var steps = route.steps;

      var points = [];

      for (var i = 0; i < steps.length; ++i) {
        var step = steps[i];

        points.push({ lat: step.start_point.lat(), lng:step.start_point.lng()});
        if (i === steps.length - 1) {
          points.push({ lat: step.end_point.lat(), lng:step.end_point.lng()});
        }
      }


      impl.polyline.setPoints(points);
    }

    return {
      setDirections : function(directions) {
        if (!impl.polyline) {
          impl.defferecDirections = directions;
        } else {
          setPolylinePointsFromDirections(directions);
        }
      }
    }
  }

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
  '$injector',
  directive
]);
