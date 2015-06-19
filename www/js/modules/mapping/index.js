angular.module('app.modules.mapping.services', []);
angular.module('app.modules.mapping.controllers', []);
angular.module('app.modules.mapping.directives', []);

angular.module('app.modules.mapping', [
  'app.modules.mapping.controllers',
  'app.modules.mapping.directives',
  'app.modules.mapping.services'
]).constant('EVENTS', {
  'ROUTE_DURATION_CHANGED_EVENT': 'waiveCarRouteDurationChanged',
  'ROUTE_DISTANCE_CHANGED_EVENT': 'waiveCarRouteDistanceChanged'
}).config([
  function() {
    'use strict';
  }
]).provider('mappingLoader', function () {
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
