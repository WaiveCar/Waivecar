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
  var $data = $injector.get('$data');
  var isFirst = true;

  function MapController() {
    this._addedMarkers = {
      location: null,
      general: []
    };
  }

  MapController.prototype.useCordova = function() {
    if (this.staticMap) {
      return false;
    }
    return !!window.plugin;
  };

  MapController.prototype.mapToGoogleLatLong = function(location) {
    return new google.maps.LatLng(location.latitude, location.longitude);
  };

  MapController.prototype.mapToNativeLatLong = function(location) {
    return { lat:location.latitude, lng:location.longitude };
  };

  MapController.prototype.mapToLatLong = function(location) {
    return this.useCordova() ? this.mapToNativeLatLong(location) : this.mapToGoogleLatLong(location);
  };

  MapController.prototype.createGMap  = function (mapElement, center, noscroll) {

    var mapOptions;

    if (this.useCordova()) {

      mapOptions = {
        'mapType': plugin.google.maps.MapTypeId.ROADMAP,
        'controls': {
          'compass': false,
          'myLocationButton': false,
          'indoorPicker': false,
          'zoom': false
        },
        'camera' : {
          target: this.mapToNativeLatLong(center),
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
        center: this.mapToGoogleLatLong(center),
        zoomControl: false
      };

      if (this.staticMap) {
        mapOptions.draggable = false;
        mapOptions.scrollwheel = false;
        mapOptions.disableDoubleClickZoom = true;
      }

      if(noscroll) {
        mapOptions.gestureHandling = 'cooperative';
      }

      return new google.maps.Map(mapElement, mapOptions);
    }
  };


  function link($scope, $elem, attrs, ctrl) {
    var center = ctrl.center ? ctrl.center : ctrl.currentLocation;
    center = center || $data.homebase;

    ctrl.staticMap = !!attrs.static;

    ctrl.map = ctrl.createGMap( $elem.find('.map-instance')[0], center, attrs.noscroll);

    ctrl.updatesQueue = [];
    ctrl.drawRouteQueue = [];

    ctrl.invokeOnMapReady($scope, function() {

      if (ctrl.useCordova()) {
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
        if (ctrl.useCordova()) {
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
            ctrl.drawRoute(value.start, value.destiny, value.intermediatePoints, value.fitBoundsByRoute);
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

  MapController.prototype.invokeOnMapReady = function invokeOnMapReady($scope,readyHandler) {
    var ctrl = this;

    if (ctrl.useCordova()) {
      ctrl.map.one(plugin.google.maps.event.MAP_READY, function() {
        $scope.$apply(readyHandler);        
      });
    } else {
      readyHandler();
    }
  };


  MapController.prototype.mapFitBounds = function mapFitBounds(markers) {
    var ctrl = this;

    if (markers && markers.length > 1) {

      var bounds = ctrl.useCordova() ? new plugin.google.maps.LatLngBounds() : new google.maps.LatLngBounds();
      markers.forEach(function (marker) {
        bounds.extend(ctrl.mapToLatLong(marker));
      });

      if (ctrl.useCordova()) {
        ctrl.map.moveCamera({ target: bounds });
      } else {
        ctrl.map.fitBounds(bounds);
      }
    }

  };

  function charge2color(marker) {
    return Math.min(2, Math.floor(marker.charge / 33));
  }

  function GeneralMapObject(mapCtrl, data) {
    this.mapCtrl = mapCtrl;
    this.data = {latitude:data.latitude, longitude:data.longitude};
    this.marker = null;
    this.zone = null;
  }

  GeneralMapObject.prototype.setMarker = function(marker) {
    this.marker = marker;
  };

  GeneralMapObject.prototype.setZone = function(zone) {
    this.zone = zone;
  };

  GeneralMapObject.prototype.remove = function() {
    if (this.mapCtrl.useCordova()) {
      if (this.marker) {
        this.marker.remove();
      }

      if (this.zone) {
        this.zone.remove();
      }

    } else {

      if (this.marker) {
        this.marker.setMap(null);
      }

      if (this.zone) {
        this.zone.setMap(null);
      }

    }
  };

  GeneralMapObject.prototype.listenOnClick = function(onClick) {
    var marker = this.marker;

    if (marker) {

      var clickHandler = function() {
        onClick(marker.getPosition());
      };

      if (this.mapCtrl.useCordova()) {
        marker.on(plugin.google.maps.event.MARKER_CLICK, clickHandler);
      } else {
        marker.addListener('click', clickHandler);
      }
    }
  };

  GeneralMapObject.prototype.hasMoved = function(data) {
    return hasMoved(this.data, data);
  };

  GeneralMapObject.prototype.update = function(data) {
    this.data = {latitude:data.latitude, longitude:data.longitude};

    if (this.marker) {
      this.marker.setPosition(this.mapCtrl.mapToLatLong(data));
    }

    if (this.zone) {

      var points = marker.shape.map(function(point) {
        return {lat: point[1], lng: point[0] };
      });

      this.zone.setPoints(points);
    }

  };

  MapController.prototype.addMarker = function addMarker(marker) {
    var ctrl = this;   
    var deferred = $q.defer();

    var type = marker.icon || marker.type;
    if('charge' in marker) {
      type = 'active-waivecar-' + charge2color(marker);
    }
    var iconOpt = getIconOptions(type, ctrl.useCordova() ? '.png' : '.svg');

    var mapObject = new GeneralMapObject(ctrl, marker);

    if (ctrl.useCordova()) {

      if (marker.type !== 'zone') {

        this.map.addMarker({
          position: ctrl.mapToNativeLatLong(marker),

          icon: {
            url: 'www/' + iconOpt.url,
            size: iconOpt.scaledSize,
            anchor: iconOpt.anchor
          }

        }, function (markerObj) {
          mapObject.setMarker(markerObj);
          deferred.resolve(mapObject);
        });
      } else if(marker.shape) {
        ctrl.map.addPolygon({
          points: marker.shape.map(function(point) {
            return {lat: point[1], lng: point[0] };
          }),
          strokeColor: '#00800080',
          strokeWidth: 2,
          fillColor: '#00A0281A'
        }, function (polygon) {
          mapObject.setZone(polygon);
          deferred.resolve(mapObject);
        });
      }
    } else {

      if (marker.type !== 'zone') {

        var markerObj = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: ctrl.mapToGoogleLatLong(marker),
          icon: iconOpt
        });

        mapObject.setMarker(markerObj);
      } else {

        var polygon = new google.maps.Polygon({
          paths: marker.shape.map(function(point) {
            return {lat: point[1], lng: point[0] };
          }),
          strokeColor: '#00AA00',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#00FF00',
          fillOpacity: 0.35
        });
        polygon.setMap(this.map);
        mapObject.setZone(polygon);
      }

      deferred.resolve(mapObject);
    }

    return deferred.promise;
  };

  MapController.prototype.addClickableMarker = function addClickableMarker(marker) {
    var ctrl = this;

    return ctrl.addMarker(marker).then(function(markerObj) {

      var onMarkerTap = ctrl.onMarkerTap();
      if (typeof onMarkerTap == 'function') {

        var onClick = function (position) {
          var zoomLevel = ctrl.useCordova() ? ctrl.map.getCameraZoom() : ctrl.map.getZoom();
          if (zoomLevel >= 13) {
            onMarkerTap(marker);
          } else {

            if (ctrl.useCordova()) {
              ctrl.map.moveCamera({target: position, zoom : 13});
            } else {
              ctrl.map.setZoom(13);
              ctrl.map.setCenter(position);
            }
          }
        };

        markerObj.listenOnClick(onClick);

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
      try {
        ctrl._addedMarkers.location.update(marker);
      } catch(ex) {
        console.log(ex, marker, ctrl, ctrl._addedMarkers.location);
      }
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

      if(currentMarker.markerObj.hasMoved(newMarker)) {
        try {
          currentMarker.markerObj.update(newMarker);
        } catch(ex) {
          console.log(ex, currentMarker);
        }
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

        var markerObj = removingMarker.markerObj;
        markerObj.remove();
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
      promises.beginMarker = ctrl.addMarker(begin).then(function(beginMarker) {
        ctrl.beginMarker = beginMarker; 
      });
    } else {
      ctrl.beginMarker.update(begin);
    }

    if (!ctrl.endMarker) {
      promises.endMarker = ctrl.addMarker(end).then(function(endMarker) {
        ctrl.endMarker = endMarker;
      });
    } else {
      ctrl.endMarker.update(end);
    }

    return $q.all(promises);
  };

  MapController.prototype.drawCarPath = function drawCarPath(start, destiny, points) {
    var ctrl = this;
    if(!ctrl.map) {
      return;
    }

    if(!points || points.length === 0) {
      points = points || [];
      points.push(start);
      points.push(destiny);
    }
    var path = points.map(ctrl.mapToLatLong.bind(this));

    if(ctrl.useCordova()) {
      ctrl.map.addPolyline({
        points: path,
        'color' : '#0000FF',
        'width': 2,
        'geodesic': true
      });
    } else {
      var polyline = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#0000FF',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });
      polyline.setMap(ctrl.map);
    }

    ctrl.mapFitBounds(points);
  }

  MapController.prototype.drawRoute = function drawRoute(start, destiny, intermediatePoints, fitBoundsByRoute) {
    var ctrl = this;

    ctrl.drawCarPath(start, destiny, intermediatePoints);

    ctrl.drawRouteMarkers( {
      latitude: start.latitude,
      longitude:  start.longitude,
      type: 'location'
    }, {
      latitude: destiny.latitude,
      longitude:  destiny.longitude,
      type: destiny.type,
      charge: destiny.charge
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
      case 'locked-car':
        return {
          url: 'img/locked-car.png' ,
          iconRetinaUrl: 'img/locked-car.png',
          scaledSize: new google.maps.Size(35, 35),
          anchor: new google.maps.Point(17, 17),
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
          url: 'img/icon-hub' + fileExt,
          iconRetinaUrl: 'img/icon-hub' + fileExt,
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

    function getPolylinePointsFromDirections(directions) {
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


      return points;
    }

    return {
      setDirections : function(directions) {

        map.addPolyline({
          'points': getPolylinePointsFromDirections(directions),
          'color' : '#55aaFF',
          'width': 10,
          'geodesic': true
        }, function(polyline) {
          if(impl.polyline) {
            impl.polyline.remove();
          }

          impl.polyline = polyline;
          
        });
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
