
function SelectedCarService($rootScope) {
  this.$rootScope;
}
SelectedCarService.prototype.setSelected = function(selected) {
  this.selected = selected;
};
SelectedCarService.prototype.getSelected = function() {
  return this.selected;
};

function ConnectionController($state,countdownEvents,$scope){
  this.timerName="connectingTimeLeft";
  this.$state=$state;
  $scope.$on(countdownEvents.counterStateFinished+'_'+this.timerName,function(){
    $state.go('dashboard');
  });
}
ConnectionController.prototype.getConnectionDurations = function() {
  return {'timeToConnect':.1};
};
ConnectionController.prototype.goToConnecting = function($state) {
  this.$state.go('cars-connecting',{'id':this.$state.params.id});
};


// Cars - List

function CarsController($rootScope, $scope, $state, selectedCar, Cars, searchEvents, mapsEvents, Data) {
  var self = this;

  this.state = $state;
  this.$rootScope = $rootScope;
  this.$scope = $scope;
  this.selectedCar = selectedCar;
  this.searchEvents = searchEvents;
  this.mapsEvents = mapsEvents;
  this.cars = Data.models.cars; // this is a cached listing of cars, populated by application controlller.
  this.user = Data.active.user; // this is a cached listing of active user, populated by auth.
}

CarsController.prototype.showCarDetails = function(marker, data) {
  var self = this;
  var latLng = {latitude: data.latitude, longitude: data.longitude};

  this.selectedCar.setSelected(data);
  this.$rootScope.$broadcast(this.mapsEvents.destinyOnRouteChanged, latLng);
  this.$rootScope.$broadcast(this.searchEvents.vehicleSelected, data);
  this.state.go('cars-show', { id: data.id});
};
// Cars - Show
function CarController($state, $q, $session, selectedCar, Users, Bookings, Data) {

  var self      = this;
  self.Users    = Users;
  self.Bookings = Bookings;
  self.session  = $session;

  Data.activate('cars', $state.params.id, function(err, activatedCar) {
    if (err) console.log('huh');
    self.car = Data.active.car;
  });

  this.selectedCar = selectedCar;
  var selectedData = selectedCar.getSelected();
  this.state = $state;
  this.$q = $q;
  if (angular.isUndefined(selectedData)) $state.go('cars');
}
CarController.prototype.getDestiny = function() {
  return this.selectedCar.getSelected();
};

CarController.prototype.book = function() {
  var self = this;
  var selectedData = this.selectedCar.getSelected();
  var carId = selectedData.id;

  // TEMP CODE TO CREATE A DRIVER, LOG THEM IN, and CREATE BOOKING.
  // NOTE: ONCE YOU HAVE CREATED A BOOKING ON A CAR, IT CANNOT BE BOOKED AGAIN...
  var user = new self.Users({
    firstName : 'Matt',
    lastName  : 'Driver',
    email     : 'matt.ginty+' + Math.random() + 'gmail.com',
    password  : 'lollipop0'
  });

  user.$save(function(u) {
    self.Users.login({ email: user.email, password: 'lollipop0' }, function(auth) {
      self.session.set('auth', auth).save();
      var booking = new self.Bookings({
        userId: user.id,
        carId: self.car.id
      });
      booking.$save(function(b) {
        self.state.go('ads',{ redirectUrl:'bookings-show', redirectParams: { 'id': booking.id } });
      });
    })
  });
  // END TEMP CODE.
};

CarController.prototype.cancel = function() {
  this.state.go('cars');
};

function FleetService($rootScope, $q, locationService, $http, Config, Data) {
  this.$q = $q;
  this.locationService = locationService;
  this.$http = $http;
  this.$rootScope = $rootScope;
  this.url = Config.uri.vehicles.getNearby;
  this.Data = Data;
}

FleetService.prototype.getNearbyFleet = function(numNearby) {
  var self = this;
  return this.locationService.getLocation().then(function(deviceLocation) {
    var ret = [];
    var maxDiff = 0.005;
    var idCount = 1;
    var minDiff = 0.0005;
    var getRandomLocationInRange = function() {
      var diffA = Math.random() * (maxDiff - minDiff) + minDiff;
      var diffB = Math.random() * (maxDiff - minDiff) + minDiff
      if (Math.random() < .5) {
        diffA = diffA * -1;
      }
      if (Math.random() < .5) {
        diffB = diffB * -1;
      }
      return {
        latitude: deviceLocation.latitude + diffA,
        longitude: deviceLocation.longitude + diffB
      };
    }
    _.each(self.Data.models.cars, function(car) {
      var loc = getRandomLocationInRange();
      car.latitude  = loc.latitude;
      car.longitude = loc.longitude;
      car.image     = '/components/ads/templates/images/ad1.png';
      car.plate     = 'AUD 568';
      car.name      = 'Chevrolet Spark',
      car.status    = {
        charge: {
          current: 69,
          timeUntilFull: 20,
          reach: 10,
          charging: true
        }
      };
    });
    return self.Data.models.cars;

    // for (var i = 0; i < numNearby; i++) {
    //   ret.push({
    //     latitude: deviceLocation.latitude + diffA,
    //     longitude: deviceLocation.longitude + diffB,
    //     status: {
    //       charge: {
    //         current: 69,
    //         timeUntilFull: 20,
    //         reach: 10,
    //         charging: true
    //       }
    //     },
    //     name:'Chevrolet Spark',
    //     plate:'AUD 568',
    //     id: idCount++,
    //     image:'/components/ads/templates/images/ad1.png'
    //   });
    // }

    // return ret;

    //HOlding until new API is up
    // var defered=self.$q.defer();
    // var config={
    //     timeout:TIMEOUT_REQUEST,
    //     method:"POST",
    //     data:{location:deviceLocation,numNearby:numNearby},
    //     url:self.url
    // }
    // var startTime = new Date().getTime();
    // self.$http(config)
    // .success(function(response, status, headers, config) {
    //     defered.resolve(response.data)
    // })
    // .error(function(response, status, headers, config) {
    //     var respTime = new Date().getTime() - startTime;
    //     if(respTime >= TIMEOUT_REQUEST){
    //         defered.resolve([]);
    //     }
    //     else{
    //         defered.reject({response:response,status:status,headers:headers});
    //     }
    // });
    // return defered.promise;
  });
}

function nearbyFleetDirective(MapsLoader, $q, fleetService, realReachService, $window) {
  function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({marker: marker, info: info});
    });
  }

  function link(scope, element, attrs, ctrl) {
    fleetService.getNearbyFleet().then(function(fleet) {
      console.log("NEARBY FLEET");
      MapsLoader.getMap.then(function(L) {
        console.log("MAP");
        ctrl.mapInstance.then(function(mapInstance) {
          console.log("MAP INSTANCE");
          var waiveCarIcon = L.icon({
            iconUrl: 'img/active-waivecar.svg',
            iconRetinaUrl: 'img/active-waivecar.svg',
            iconSize: [40, 50],
            iconAnchor: [20, 50],
            popupAnchor: [0 , 0]
          });

          var latLng;
          var markers = [];
          var marker;

          fleet.forEach(function(f) {
            marker = L.marker([f.latitude, f.longitude], {icon: waiveCarIcon}).addTo(mapInstance);
            addMarkerClick(marker, f, scope.onClickMarker);
            markers.push(marker);
          });
          if(markers.length>0){
            var group = new L.featureGroup(markers);
            mapInstance.fitBounds(group.getBounds().pad(0.5))
            
          }
          // realReachService.getReachInMinutes(15,TRANSPORT_PEDESTRIAN).then(function(reach){
          //   var numPoints=reach.realReach.gpsPoints.length;
          //   var polygonPoints=[];
          //   var latLng;
          //       //No idea why we have to skip the first 8
          //       for(var i=8; i<numPoints; i+=2){
          //         //No idea why they invert this also
          //         latLng=new L.LatLng(reach.realReach.gpsPoints[i+1], reach.realReach.gpsPoints[i]);
          //         polygonPoints.push(latLng);
          //     }
          //     var polygon = new L.Polygon(polygonPoints);
          //     mapInstance.addLayer(polygon);
          //     scope.reachPolygon=polygon;
          //     marker=L.marker(latLng,{icon:waiveCarIcon}).addTo(mapInstance);
          //     ctrl.solveDestiny(marker);
          //     addMarkerClick(marker);
          // });
        });
      });

    });
  }
  return {
    restrict: 'CE',
    link: link,
    require: '^map',
    scope: {
      onClickMarker: '&'
    }
  }
}
function carChargeStatusDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
    var selectedData = selectedCar.getSelected();
    if (!selectedData) {
      return;
    }
    var details = selectedData.status;
    scope.chargeLevel = details.charge.current + '%';
    if (details.charge.charging) {
      scope.chargeState = 'Parked at charging station';
      scope.chargeFull =  details.charge.timeUntilFull + ' minutes';
    } else {
      scope.chargeState = 'Not charging';
    }

    scope.chargeReach = details.charge.reach+' miles ';
  }

  return {
    restrict: 'E',
    link: link,
    templateUrl: 'components/cars/templates/directives/carChargeStatus.html'
  }
}
function carInformationDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
    scope.$watch(function(){
      return selectedCar.getSelected();
    },
    function(){
      var details = selectedCar.getSelected();
      if(details){
        scope.name = details.name;
        scope.plate = details.plate;
        scope.image=details.image;
      }
    })
  }
  return {
    restrict: 'E',
    link: link,
    transclude: true,
    templateUrl: 'components/cars/templates/directives/carInformation.html'
  }
}
angular.module('app')
.constant('searchEvents', {
  vehicleSelected: 'vehicleSelected'
})
.service('selectedCar', [
  '$rootScope',
  SelectedCarService
])
.service('fleetService', [
  '$rootScope',
  '$q',
  'locationService',
  '$http',
  'Config',
  'Data',
  FleetService
])
.controller('CarController', [
  '$state',
  '$q',
  '$session',
  'selectedCar',
  'Users',
  'Bookings',
  'Data',
  CarController
])
.controller('ConnectionController',['$state','countdownEvents','$scope',ConnectionController])
.controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  'selectedCar',
  'Cars',
  'searchEvents',
  'mapsEvents',
  'Data',
  CarsController
])
.directive('carChargeStatus', [
  'searchEvents',
  'selectedCar',
  carChargeStatusDirective
])
.directive('nearbyFleet', ['MapsLoader', '$q', 'fleetService', 'realReachService', '$window', nearbyFleetDirective])
.directive('carInformation', [
  'searchEvents',
  'selectedCar',
  carInformationDirective
]);
