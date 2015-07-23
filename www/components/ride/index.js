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

function PaidRideService(){

}
PaidRideService.prototype.startRide = function() {
  this.startTime=new Date().getTime();
};
PaidRideService.prototype.getRideTime = function() {
    var currentRemainingTime = (new Date().getTime() - this.startTime)/1000;
    var hours = Math.floor(currentRemainingTime / 3600);
    currentRemainingTime -= (hours * 3600);
    var minutes = Math.floor(currentRemainingTime / 60);
    currentRemainingTime -= (minutes * 60);
    var seconds = Math.floor(currentRemainingTime);
    return {
      hours: hours,
      minutes: minutes,
      seconds: seconds
    }
  
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
function formatTime(hours,minutes,seconds){
   if (typeof hours != 'undefined' && hours > 0) {
      return hours + ':' + minutes + 'h';
    }      else if (typeof minutes != 'undefined' && minutes > 0) {
      return minutes + ':' + seconds + 'm';
    }      else if (typeof seconds != 'undefined' && seconds > 0) {
      return seconds + 's';
    }      else {
      return '0:0:0';
    }
}

function freeRideTimeDirective(formatTime) {
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
      scope.timeLeftDisplay = formatTime(ctrl.hours,ctrl.minutes,ctrl.seconds);
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
function paidRideTimeDirective($interval,paidRideService,formatTime) {
  function link(scope, element, attrs, ctrl) {
    paidRideService.startRide();
    $interval(function(){
      var time=paidRideService.getRideTime();
      scope.timeLeftDisplay = formatTime(time.hours,time.minutes,time.seconds);
    },1000);

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
.service('PaidRideService',PaidRideService)
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
.value('formatTime',formatTime)
.directive('chargingStationInfo', chargingStationInfoDirective)
.directive('freeRideTime',['formatTime', freeRideTimeDirective])
.directive('paidRideTime',['$interval','PaidRideService','formatTime',paidRideTimeDirective]);