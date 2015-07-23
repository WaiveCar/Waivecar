function RideController($scope, $state) {
  this.$scope = $scope;
  this.showingStation = false;
  this.$state = $state;
}
RideController.prototype.showChargingStationDetails = function(marker, info) {
  this.showingStation = true;
  this.stationName = info.name;
  this.stationAddress = info.address;
  this.stationDistance = info.distance;
  this.$scope.$digest();
};
RideController.prototype.hideChargingStationDetails = function(marker, info) {
  this.showingStation = false;
}
RideController.prototype.endRide = function() {
  this.$state.go('ride-end');
};
function distanceTravelledDirective($interval) {
  function link(scope) {
    scope.mileage=0;
    var stop=$interval(function(){
      scope.mileage+=10;
      scope.value=scope.mileage+' miles';
    },1500);
    scope.value = scope.mileage+' miles';
  }
  return {
    link: link,
    template: '<span ng-bind="value"></span>',
    scope: true
  }
}
function batteryChargeDirective($interval,$state) {
  function link(scope) {
    scope.battery=100;
    scope.value=scope.battery+'%';
    var stop=$interval(function(){
      scope.battery-=5;
      if(scope.battery<=0){
        if(scope.battery<=15){
          $state.go('ride-alert-low-battery');
        }
        $interval.cancel(stop);
      }
      scope.value=scope.battery+'%';
    },2000)

  }
  return {
    link: link,
    template: '<span ng-bind="value"></span>',
    scope: true
  }
}


function freeRideTimeDirective() {
  function link(scope, element, attrs, ctrl) {
    var durations = {'freeRide': 120};
    ctrl.createTimer('freeRide', durations);
    ctrl.start();
    var watchExpressions = [
      function() {
        return ctrl.seconds;
      },
      function() {
        return ctrl.minutes;
      },
      function() {
        return ctrl.seconds;
      }
    ];
    scope.$watchGroup(watchExpressions, function(newValues, oldValues, scope) {
      if (typeof ctrl.hours != 'undefined' && ctrl.hours > 0) {
        scope.timeLeftDisplay = ctrl.hours + ':' + ctrl.minutes + 'h';
      }      else if (typeof ctrl.minutes != 'undefined' && ctrl.minutes > 0) {
        scope.timeLeftDisplay = ctrl.minutes + ':' + ctrl.seconds + 'm';
      }      else if (typeof ctrl.seconds != 'undefined' && ctrl.seconds > 0) {
        scope.timeLeftDisplay = ctrl.seconds + 's';
      }      else {
        scope.timeLeftDisplay = '0:0:0';
      }
    });

  }
  return {
      restrict: 'E',
      templateUrl: 'components/ride/templates/directives/freeRideTime.html',
      link: link,
      controller: 'TimerController',
      controllerAs: 'timer',
      scope: false
    }

}
function chargingStationInfoDirective() {
  return {
    templateUrl: 'components/ride/templates/directives/chargingStationInfo.html'
  }
}

angular.module('app')
.controller('RideController', [
  '$scope',
  '$state',
  RideController
])
.directive('batteryCharge', [
  '$interval',
  '$state',
  batteryChargeDirective
])
.directive('distanceTravelled', [
  '$interval',
  distanceTravelledDirective
])
.directive('chargingStationInfo', chargingStationInfoDirective)
.directive('freeRideTime', freeRideTimeDirective);