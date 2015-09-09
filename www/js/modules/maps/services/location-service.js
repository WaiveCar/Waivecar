angular.module('Maps').service('LocationService', [
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

        var watch = $cordovaGeolocation.watchPosition(posOptions);

        watch.then(null, function (err) {}, function (position) {
          var positionEvent = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          $rootScope.$broadcast(MapsEvents.positionChanged, positionEvent);
        });
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

        if (typeof service.pendingRequest != 'undefined' && service.pendingRequest) {
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
])
