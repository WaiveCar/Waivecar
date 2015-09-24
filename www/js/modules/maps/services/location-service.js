'use strict';
var angular = require('angular');

module.exports = angular.module('Maps').service('LocationService', [
  '$rootScope',
  '$cordovaGeolocation',
  '$q',
  'MapsEvents',
  '$state',
  '$message',
  function ($rootScope, $cordovaGeolocation, $q, MapsEvents, $state, $message) {

    var service = {

      setManualPosition: function (latitude, longitude) {
        service.manualPosition = {
          latitude: latitude,
          longitude: longitude
        };

        $rootScope.$broadcast(MapsEvents.positionChanged, service.manualPosition);
      },

      init: function () {
        service.initPositionWatch();
      },

      initPositionWatch: function () {
        var posOptions = {
          maximumAge: 3000,
          timeout: 8000,
          enableHighAccuracy: true
        };

        service.watch = $cordovaGeolocation.watchPosition(posOptions);

        service.watch.then(null, function (err) {
          console.log('error in retrieving current location');
          console.log(err);
        }, function (position) {
          console.log('updating location to ' + position.coords.latitude + ', ' + position.coords.longitude);
          $rootScope.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
        });
      },

      clearWatch: function () {
        service.watch.clearWatch();
      },

      getLocation: function () {
        var defered = $q.defer();
        if (typeof service.manualPosition !== 'undefined' && !!service.manualPosition) {
          defered.resolve(service.manualPosition);
          return defered.promise;
        }

        var posOptions = {
          maximumAge: 3000,
          timeout: 8000,
          enableHighAccuracy: true
        };

        if (service.pendingRequest) {
          return service.pendingRequest;
        }

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          defered.resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          service.pendingRequest = null;
        }, function (err) {
          defered.reject(err);
          $message.error('We were not able to find your location, please reconnect.');
          service.pendingRequest = null;
        });

        service.pendingRequest = defered.promise;
        return service.pendingRequest;
      }

    };

    return service;

  }
]);
