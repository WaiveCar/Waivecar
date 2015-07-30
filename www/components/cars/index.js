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

function CarsController($rootScope, $scope, $state, selectedCar, searchEvents, mapsEvents, DataService,mockLocation) {
  var self          = this;
  this.$state        = $state;
  this.$rootScope   = $rootScope;
  this.$scope       = $scope;
  this.all          = DataService.all;
  this.active       = DataService.active;
  this.selectedCar  = selectedCar;
  this.searchEvents = searchEvents;
  this.mapsEvents   = mapsEvents;
  this.mockLocation = mockLocation;
}

CarsController.prototype.showCarDetails = function(marker, data) {
  var self = this;
  var latLng = {latitude: data.latitude, longitude: data.longitude};

  this.selectedCar.setSelected(data);
  this.$rootScope.$broadcast(this.mapsEvents.destinyOnRouteChanged, latLng);
  this.$rootScope.$broadcast(this.searchEvents.vehicleSelected, data);
  this.$state.go('cars-show', { id: data.id });
};
CarsController.prototype.locateMe = function() {
  console.log("LOCATE ME !");
  this.mockLocation.mockLocation();
};

// Cars - Show
function CarController($state, $q, selectedCar, DataService) {

  var self          = this;
  self.$state        = $state;
  self.$q           = $q;
  self.DataService  = DataService;
  self.UserResource = DataService.resources.users;
  self.car          = DataService.active;

  self.DataService.activate('cars', $state.params.id, function(err, activatedCar) {
    if (err) console.log(err);
  });

  this.selectedCar = selectedCar;
  var selectedData = selectedCar.getSelected();
  if (angular.isUndefined(selectedData)) $state.go('cars');
}

CarController.prototype.getDestiny = function() {
  return this.selectedCar.getSelected();
};

CarController.prototype.chooseCar = function() {
  var self         = this;
  var selectedData = this.selectedCar.getSelected();
  var carId        = selectedData.id;

  self.$state.go('users-new', {
    redirectUrl    :'bookings-new',
    redirectParams : {
      carId     : self.DataService.active.cars.id,
      includeAd : true
    }
  });
};

CarController.prototype.cancel = function() {
  this.state.go('cars');
};

function FleetService($rootScope, $q, locationService) {
  this.$q = $q;
  this.locationService = locationService;
  this.$rootScope = $rootScope;

}

FleetService.prototype.getNearbyFleet = function(location,cars) {
  var self = this;
    var ret = [];
    var idCount = 1;
    var ret=[];
    _.each(cars, function(car) {
      var loc = self.getRandomLocationInRange(location);
      car.latitude  = car.location.latitude;
      car.longitude = car.location.longitude;
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
      ret.push(car);
    });
    return ret;
}
FleetService.prototype.getRandomLocationInRange = function(location) {
  var maxDiff = 0.005;
  var minDiff = 0.0005;
  var diffA = Math.random() * (maxDiff - minDiff) + minDiff;
    var diffB = Math.random() * (maxDiff - minDiff) + minDiff
    if (Math.random() < .5) {
      diffA = diffA * -1;
    }
    if (Math.random() < .5) {
      diffB = diffB * -1;
    }
    return {
      latitude: location.latitude + diffA,
      longitude: location.longitude + diffB
    };
};

function nearbyFleetDirective(MapsLoader, $q, fleetService, realReachService, locationService,DataService,$rootScope) {
  var self=this;
  function addMarkerClick(marker, info, onClickFn) {
    marker.on('mousedown', function(e) {
      onClickFn({marker: marker, info: info});
    });
  }

  function link(scope, element, attrs, ctrl) {

      MapsLoader.getMap.then(function(L) {
        self.L=L;
        console.log('maps');
        return ctrl.mapInstance;
      })
      .then(function(mapInstance){
        self.mapInstance=mapInstance;
        console.log('mapInstance');
        return locationService.getLocation();
      })
      .then(function(deviceLocation){
        console.log('Location');
        self.deviceLocation=deviceLocation;
      })
      .then(function(){
         var waiveCarIcon = self.L.icon({
          iconUrl: 'img/active-waivecar.svg',
          iconRetinaUrl: 'img/active-waivecar.svg',
          iconSize: [20, 25],
          iconAnchor: [10, 25],
          popupAnchor: [0 , 0]
        });
        $rootScope.$watch(function(){
          return DataService.all.cars;
        },
        function(cars,oldCars){
          console.log("Cars");
          console.log(DataService.all.cars.length);
   
          if(scope.group){
            self.mapInstance.removeLayer(scope.group);
            scope.markers.forEach(function(marker){
              self.mapInstance.removeLayer(marker);
            });
          }
          
          var fleet=fleetService.getNearbyFleet(self.deviceLocation,DataService.all.cars);

          var markers = [];
          var marker;
          fleet.forEach(function(f) {
            marker = L.marker([f.latitude, f.longitude], {icon: waiveCarIcon}).addTo(self.mapInstance);
            addMarkerClick(marker, f, scope.onClickMarker);
            markers.push(marker);
          });
          if(markers.length>0){
            var group = new L.featureGroup(markers);
            // self.mapInstance.fitBounds(group.getBounds().pad(0.5))
            scope.group=group;
            scope.markers=markers;
          }

        },
        true);
      })
  }
  return {
    restrict: 'E',
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
      scope.chargeFull  = details.charge.timeUntilFull + ' minutes';
    } else {
      scope.chargeState = 'Not charging';
    }

    scope.chargeReach = details.charge.reach+' miles ';
  }

  return {
    restrict    : 'E',
    link        : link,
    templateUrl : 'components/cars/templates/directives/carChargeStatus.html'
  }
}

function carInformationDirective(searchEvents, selectedCar) {
  function link(scope, element, attrs, ctrl) {
    scope.$watch(function(){
      return selectedCar.getSelected();
    },
    function(){
      var details = selectedCar.getSelected();
      if (details) {
        scope.name  = details.name;
        scope.plate = details.plate;
        scope.image = details.image;
      }
    })
  }
  return {
    restrict    : 'E',
    link        : link,
    transclude  : true,
    templateUrl : 'components/cars/templates/directives/carInformation.html'
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
  FleetService
])
.controller('CarController', [
  '$state',
  '$q',
  'selectedCar',
  'DataService',
  CarController
])
.controller('ConnectionController', [
  '$state',
  'countdownEvents',
  '$scope',
  ConnectionController
])
.controller('CarsController', [
  '$rootScope',
  '$scope',
  '$state',
  'selectedCar',
  'searchEvents',
  'mapsEvents',
  'DataService',
  'mockSanFranLocationService',
  CarsController
])
.directive('carChargeStatus', [
  'searchEvents',
  'selectedCar',
  carChargeStatusDirective
])
.directive('nearbyFleet', [
  'MapsLoader',
  '$q',
  'fleetService',
  'realReachService',
  'locationService',
  'DataService',
  '$rootScope',
  nearbyFleetDirective
])
.directive('carInformation', [
  'searchEvents',
  'selectedCar',
  carInformationDirective
]);