function GeocodingService($rootScope, $q, $http) {
  this.$rootScope = $rootScope;
  this.$http = $http;
  this.$q = $q;

}
GeocodingService.prototype.getReverseGeoCoding = function(latitude, longitude) {
  var url = 'http://nominatim.openstreetmap.org/reverse?format=json&zoom=18&addressdetails=1&lat=' + latitude + '&lon=' + longitude;
  var defered = this.$q.defer();
  this.$http.get(url)
    .success(function(data, status, headers, config) {
      console.log('success');
      console.log(arguments);
      defered.resolve(data);
    })
    .error(function(data, status, headers, config) {
      console.log('error');
      console.log(arguments);
      defered.reject({data: data, status: status, header: headers, config: config});
    });
  return defered.promise;
};
function reverseGeoCodingDirective(geocodingService) {
  function link(scope, element, attrs, ctrl) {
    var latLng = scope.getLocation();
    if(!latLng){
      return;
    }
    geocodingService.getReverseGeoCoding(latLng.latitude, latLng.longitude)
        .then(function(locationData) {
          if(locationData.address){
            scope.houseNumber = locationData.address.house_number || '';
            scope.road = locationData.address.road;
          }
        });
  }
  return {
    restrict: 'E',
    link: link,
    scope: {
          getLocation: '&'
        },
    template: '<span ng-bind="road"></span>,<span ng-bind="houseNumber"></span>'
  }
}
angular.module('Maps.geoCoding', ['Maps'])
.service('GeocodingService', ['$rootScope', '$q', '$http', GeocodingService])
.directive('reverseGeoCoding', ['GeocodingService', reverseGeoCodingDirective]);