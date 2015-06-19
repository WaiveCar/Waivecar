angular.module('app.modules.mapping.services').service('$fleet', [
  '$rootScope',
  '$q',
  '$mapLocation',
  function ($rootScope, $q, $mapLocation) {
    'use strict';

    var svc = {

      getNearbyFleet: function(numNearby) {
        //Mockup to get nearby fleet nearby of person,On production it'll send to server
        numNearby = numNearby || 10;
        var maxDiff = 0.005;
        var minDiff = 0.0005;

        //mockups
        return $mapLocation.getLocation().then(function(deviceLocation) {
          var ret=[];

          for (var i=0; i<numNearby; i++) {
            var diffA = Math.random() * (maxDiff - minDiff) + minDiff;
            var diffB = Math.random() * (maxDiff - minDiff) + minDiff
            if (Math.random() < .5) {
              diffA = diffA * -1;
            }

            if (Math.random() < .5) {
              diffB = diffB * -1;
            }

            ret.push({
              latitude: deviceLocation.latitude + diffA,
              longitude: deviceLocation.longitude + diffB
            });
          }

          return ret;
        }, function(err) {

        });
      }

    };

    return svc;
  }
]);
