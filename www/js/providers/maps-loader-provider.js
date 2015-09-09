angular.module('app.providers').provider('MapsLoader', [
  function() {
    var options;
    var apiKey = '7ef929e2c765b1194804e5e8ca284c5a';
    return {
      $get: function($q, $window) {
        L.skobbler.apiKey = apiKey;
        var deferred = $q.defer();
        deferred.resolve(L);
        return {
          getMap: deferred.promise
        }
      },
      setOption: function() {
        //TBD
      }
    }
  }
]);