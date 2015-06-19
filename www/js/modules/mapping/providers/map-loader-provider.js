angular.module('app.modules.mapping.providers').provider('mappingLoader', function () {
  'use strict';

  var options;
  function loadScript() {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&callback=waiveCar_mapsCallback';
    document.body.appendChild(script);
  };

  var provider = {
    $get: [
      '$q',
      '$window',
      function($q, $window) {
        var deferred = $q.defer();

        $window.waiveCar_mapsCallback = function() {
          deferred.resolve(google.maps);
        };

        loadScript();

        return {
          getMap: deferred.promise
        };

      }
    ],

    setOption: [
      function() {
      //TBD
      }
    ]
  };

  return provider;

});
