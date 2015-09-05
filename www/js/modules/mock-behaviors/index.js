function mockWalkingDirective(MapsEvents,$rootScope){
	function link(scope, element, attrs, ctrl) {

		ctrl.locationMarker.then(function(marker){
			marker.on('dragend', function(event){
				 var deviceLocation=marker.getLatLng();
	          	$rootScope.$broadcast(MapsEvents.positionChanged,{latitude:deviceLocation.lat,longitude:deviceLocation.lng});
			});
		});
	}
	return {
		restrict : 'CAE',
		link     : link,
    require  : '^map',
    scope    : {
      location : '='
    }
	}
}
function mockCityLocationService($rootScope, LocationService, $q){
	this.LocationService = LocationService;
  this.$q = $q;
  this.$rootScope = $rootScope;
}
function mockCarAvailabilityService($q){
	this.$q=$q;
}
mockCarAvailabilityService.prototype.isCarAvailable = function() {
	return this.$q.when(true);
};
mockCityLocationService.prototype.mockLocation = function() {
  // Mock location:
  // "latitude": 34.0604643,
  // "longitude": -118.4186743,
  // "city": "Los Angeles",
  // "state": "CA",
  // "street_address": "10250 Santa Monica Blvd",
  // "zip": "90067",
  this.$rootScope.currentLocation = {
    latitude  : 34.0604643,
    longitude : -118.4186743
  };

	this.LocationService.setManualPosition(34.0604643, -118.4186743);
};

function getRandomLocation(x0, y0, radius) {
  var random          = Math.random();
  var radiusInDegrees = radius / 111300;

  var u  = Math.random();
  var v  = Math.random();
  var w  = radiusInDegrees * Math.sqrt(u);
  var t  = 2 * Math.PI * v;
  var x  = w * Math.cos(t);
  var y1 = w * Math.sin(t);
  var x1 = x / Math.cos(y0);

  return [ (y0 + y1), (x0 + x1) ];
}

mockCityLocationService.prototype.initPositionWatch = function() {
  var prevLocation = {
    latitude  : 34.0604643,
    longitude : -118.4186743
  };


  var self = this;

  function update() {
    var newLocation = getRandomLocation(prevLocation.latitude, prevLocation.longitude, 20);
    prevLocation.latitude = newLocation[1];
    prevLocation.longitude = newLocation[0];
    //self.$rootScope.$apply(function() {
      self.$rootScope.currentLocation = {
        latitude  : prevLocation.latitude,
        longitude : prevLocation.longitude
      };
    //});
  }

  update();

  //setInterval(update, 2000);
};

mockCityLocationService.prototype.setLocation = function(location, isFuzzy) {
  var self = this;
  isFuzzy = isFuzzy || true;
  if (isFuzzy) {
    var locations = getRandomLocation(location.latitude, location.longitude, 10);
    self.$rootScope.currentLocation.latitude = locations[1];
    self.$rootScope.currentLocation.longitude = locations[0];
  } else {
    self.$rootScope.currentLocation = angular.clone(location);
  }
};

mockCityLocationService.prototype.getLocation = function() {
  var defered = this.$q.defer();
  var position = {
    latitude  : 34.0604643,
    longitude : -118.4186743
  };
  defered.resolve(position);
  return defered.promise;
};

angular.module('MockBehaviors', [])
.service('MockLocationService', [ '$rootScope', 'LocationService', '$q', mockCityLocationService ])
.service('CarAvailabilityService',[ '$q', mockCarAvailabilityService ])
.directive('mockWalking', [ 'MapsEvents','$rootScope', mockWalkingDirective ]);
