angular.module('app.modules.mapping.services').service('$mapLocation', [
  '$rootScope',
  '$q',
  '$cordovaGeolocation',
  function ($rootScope, $q, $cordovaGeolocation) {
    'use strict';
    var svc = {

      savedLocation: undefined,

      getLocation: function(timeoutLimit, enableHighAccuracy) {
        timeoutLimit = timeoutLimit || 10000;
        var posOptions = { timeout: timeoutLimit, enableHighAccuracy: enableHighAccuracy };
        var defered = $q.defer();
        if (svc.savedLocation) {
          defered.resolve(svc.savedLocation);
          return defered.promise;
        }

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
          console.log("CURRENT POSITION "+JSON.stringify(position));
          console.log(position.coords.latitude+ " "+position.coords.longitude);
          defered.resolve({
            latitude:position.coords.latitude,
            longitude:position.coords.longitude,
          });
        });

        return defered.promise;
      }

    };

    return svc;
  }
]);
