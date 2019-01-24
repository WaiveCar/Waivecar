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
    if(!plugin || !plugin.google) {
      $window.plugin = $window.plugin || {};
      $window.plugin.google = google;
    }
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
    return this.mapToNativeLatLong(location);
  };

  MapController.prototype.createGMap  = function (mapElement, center, noscroll) {
    // reference: https://developers.google.com/maps/documentation/android-api/controls

    var mapOptions = {
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
  };


  function link($scope, $elem, attrs, ctrl) {
    // we need a place to put this map. We have 5 fallbacks if it gets initialized without something.
    var center = ctrl.center 
      || ctrl.currentLocation 
      || $data.homebase 
      || $rootScope.currentLocation 
      || $data.me
      || {latitude: 34.0195, longitude: -118.4912}; 
         // ^^ if nothing works then we throw up our hands, 
         // yell "fuck it" and just start in santa monica.

    ctrl.staticMap = !!attrs.static;

    // console.log($rootScope, ctrl, center, attrs, $elem, $scope, ctrl.currentLocation,  $data.homebase);

    ctrl.map = ctrl.createGMap( $elem.find('.map-instance')[0], center, attrs.noscroll);

    ctrl.helpContainer = $elem.find('.help')[0];
    ctrl.helpLink = $elem.find('.help-link')[0];
    $elem.find('.help-link')[0].addEventListener('click', function() {
      ctrl.helpContainer.style.display = 'block';
      ctrl.helpLink.style.display = 'none';
    });
    $elem.find('.close')[0].addEventListener('click', function() {
      ctrl.helpContainer.style.display = 'none';
      ctrl.helpLink.style.display = 'block';
    });


    // this is used for compatibility purposes.
    if(!ctrl.map.moveCamera) {
      ctrl.map.moveCamera = function(args) {
        ctrl.map.fitBounds(args.target);
      }
    }

    ctrl.updatesQueue = [];
    ctrl.drawRouteQueue = [];

    ctrl.invokeOnMapReady($scope, function() {

      $rootScope.$on('mainMenuStateChange', function (event, data) {
        if (data === 'open') {
          ctrl.map.setClickable(false);
        }
        if (data === 'close') {
          ctrl.map.setClickable(true);
        }
      });

      if ('route' in attrs) {
        ctrl.directionsRenderer = createNativeDirectionsRenderer(ctrl.map)
      }

      var lastLocation = [0, 0];
      var watchers = [
        $scope.$watch('map.markers', function (value) {
          //console.log("marker update", value);
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

    ctrl.map.one(plugin.google.maps.event.MAP_READY, function() {
      $scope.$apply(readyHandler);
    });
  };


  MapController.prototype.mapFitBounds = function mapFitBounds(markers) {
    var ctrl = this;
    //console.log('fitting around', markers);

    if (markers && markers.length > 1) {

      var bounds = new plugin.google.maps.LatLngBounds();
      markers.forEach(function (marker) {
        bounds.extend(ctrl.mapToLatLong(marker));
      });

      ctrl.map.moveCamera({ target: bounds });
    }
  };

  function charge2color(marker) {
    var miles =  marker.range;
    var cutoffList = (marker.model === 'Tucson' && [180, 100]) || [80, 40];
    if (miles >= cutoffList[0]) {
      return 2;
    }
    if (miles >= cutoffList[1]) {
      return 1;
    } 
    return 0;
  }

  function GeneralMapObject(mapCtrl, data) {
    this.mapCtrl = mapCtrl;
    this.data = {latitude:data.latitude, longitude:data.longitude};
    this.marker = null;
    this.geometry = null;
  }

  GeneralMapObject.prototype.setMarker = function(marker) {
    this.marker = marker;
  };

  GeneralMapObject.prototype.setZone = function(geometry) {
    this.geometry = geometry;
  };
  
  GeneralMapObject.prototype.setParking = function(geometry) {
    this.geometry = geometry;
  };

  GeneralMapObject.prototype.remove = function() {
    if (this.marker) {
      this.marker.remove();
    }

    if (this.geometry) {
      this.geometry.remove();
    }
  };

  GeneralMapObject.prototype.listenOnClick = function(onClick) {
    var marker = this.marker;

    if (marker) {

      var clickHandler = function() {
        onClick(marker.getPosition());
      };

      marker.on(plugin.google.maps.event.MARKER_CLICK, clickHandler);
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

    if (this.geometry) {

      var points = marker.shape.map(function(point) {
        return {lat: point[1], lng: point[0] };
      });

      this.geometry.setPoints(points);
    }

  };

  MapController.prototype.addMarker = function addMarker(marker) {
    var ctrl = this;
    var deferred = $q.defer();

    var type = marker.icon || marker.type;

    if('charge' in marker) {
      if('model' in marker) {
        marker.range = marker.range || (marker.charge * ({"Spark EV":65,Tucson:255}[marker.model] || 132));
        type = 'active-waivecar-' + charge2color(marker);
        if(marker.isReallyAvailable === false) {
          type += '-noavail';
        }
      } else {
        type = 'locked-car';
      }
    }
    var iconOpt = getIconOptions(type, ctrl.useCordova() ? '.png' : '.svg', marker);

    var mapObject = new GeneralMapObject(ctrl, marker);

    if(marker.type === 'circle') {
      ctrl.map.addCircle({
        position: ctrl.mapToNativeLatLong(marker),
        radius: marker.radius,
        strokeColor: '#00008080',
        fillColor: '#0028A01A',
        strokeWidth: 2,
      });
    } else if(marker.type === 'zone') {
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
      
    } else if(marker.type === 'parking') {
      ctrl.map.addPolyline({
        points: marker.shape.map(function(point) {
          return {lat: point[1], lng: point[0] };
        }),
        color: '#00800080',
        width: 2
      }, function (polygon) {
        mapObject.setParking(polygon);
        deferred.resolve(mapObject);
      });
    } else  {

      ctrl.map.addMarker({
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
            ctrl.map.moveCamera({target: position, zoom : 13});
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

    // this is a replay system to addresss a backlog.
    function onUpdateFinish() {
      var nextSet = ctrl.updatesQueue.shift();
      if(nextSet) {
        ctrl.unsafeUpdateMarkers(nextSet).then(onUpdateFinish);
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

    // This is hacky, but works to update markers for the user-parking to show if they are available or not
    newMarkers.forEach(function (marker) {
      if (marker.type === 'user-parking') {
        markersToAdd.push(marker.id);
      }
    });

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

    ctrl.map.addPolyline({
      points: path,
      color: '#0000FF',
      width: 2,
      geodesic: true
    });

    ctrl.mapFitBounds(points);
  }

  MapController.prototype.drawRoute = function drawRoute(start, destiny, intermediatePoints, fitBoundsByRoute) {
    var ctrl = this;

    if(!intermediatePoints) {
      RouteService.getGRoute(ctrl.mapToGoogleLatLong(start), ctrl.mapToGoogleLatLong(destiny), function(response) {
        ctrl.directionsRenderer.setDirections(response);
      });
    } else {
      ctrl.drawCarPath(start, destiny, intermediatePoints);
    }

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
    if(fitBoundsByRoute) {
      ctrl.mapFitBounds([start, destiny]);
    }
  };

  function getIconOptions(iconType, fileExt, marker) {
    switch (iconType) {
      case 'active-waivecar':
      case 'active-waivecar-0':
      case 'active-waivecar-1':
      case 'active-waivecar-2':
      case 'active-waivecar-0-noavail':
      case 'active-waivecar-1-noavail':
      case 'active-waivecar-2-noavail':
      case 'valet-active':
      case 'valet':
      case 'homebase':
      case 'homebase-nocars':
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
      case 'station':
      case 'station-active':
        return {
          url: 'img/icon-' + iconType + fileExt,
          iconRetinaUrl: 'img/icon-' + iconType + fileExt,
          scaledSize: new google.maps.Size(17, 23),
          anchor: new google.maps.Point(8, 22),
          origin: new google.maps.Point(0, 0)
        };
      case 'chargingStation':
        return {
          url: 'img/icon-station-free' + fileExt,
          iconRetinaUrl: 'img/icon-station' + iconType + fileExt,
          scaledSize: new google.maps.Size(17, 23),
          anchor: new google.maps.Point(8, 22),
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
      case 'user-parking':
        var fileName = marker.status === 'available' ? 'parking-available' : 'parking-in-use';
        return {
          url: 'img/' + fileName + fileExt,
          iconRetinaUrl: 'img/' + fileName + fileExt,
          scaledSize: new google.maps.Size(24, 24),
          anchor: new google.maps.Point(12, 12),
          origin: new google.maps.Point(0, 0)
        }
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
    template: [
      '<div class="map-instance">',
        '<div class="help-wrap">',
          '<a class="help-link">&#xFFFD; Help</a>',
          '<div class="help">',
            '<div class="help-iframe">',
              '<iframe src="https://waive.car/guide"></iframe>',
            '</div>',
            '<a class="close">&#x2716;</a>',
          '</div>',
        '</div>',
      '</div>'
    ].join(''),
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
