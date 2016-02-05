'use strict';
var angular = require('angular');
require('../services/timer-service');

module.exports = angular.module('app.controllers').controller('TimerController', [
  '$scope',
  '$interval',
  'TimerService',
  'countdownEventsConstant',
  function TimerController($scope, $interval, TimerService, countdownEvents) {
    var ctrl = this;

    ctrl.minutes = 0;
    ctrl.seconds = 0;
    ctrl.hours = 0;
    // var status;
    var unbindList = [];
    var _timerName;
    var _stopInterval;

    ctrl.stopCount = function() {
      if (angular.isDefined(_stopInterval)) {
        $interval.cancel(_stopInterval);
        _stopInterval = void 0;
      }
    };

    ctrl.startCount = function() {
      ctrl.stopCount();
      // status = TimerService.getStatus(_timerName);
      var remainingTime = TimerService.getRemainingTime(_timerName);

      ctrl.hours = remainingTime.hours;
      ctrl.minutes = remainingTime.minutes;
      ctrl.seconds = remainingTime.seconds;

      var intervalFunction = function () {
        ctrl.seconds--;
        if (ctrl.seconds < 0) {
          ctrl.seconds = 59;
          ctrl.minutes--;
        }
        if (ctrl.minutes < 0) {
          ctrl.minutes = 59;
          ctrl.hours--;
        }
        if (ctrl.hours < 0) {
          ctrl.hours = 0;
          ctrl.minutes = 0;
          ctrl.seconds = 0;
          ctrl.stopCount();
        }
      };

      _stopInterval = $interval(intervalFunction, 1000);

    };

    $scope.$on('$destroy', function () {
      ctrl.stopCount();
      unbindList.map(function (u) {
        u();
      });
    });

    ctrl.createTimer = function(name, durations) {
      var unbind;
      unbind = $scope.$on(countdownEvents.newCounter + '_' + name, ctrl.startCount);
      unbindList.push(unbind);

      // unbind = $scope.$on(countdownEvents.counterStateChanged + '_' + name, function (ev, _status) {
      //   // status = _status;
      // });

      unbind = $scope.$on(countdownEvents.counterStateChanged + '_' + name, angular.identity);

      unbindList.push(unbind);

      unbind = $scope.$on(countdownEvents.counterCancelled + '_' + name, ctrl.stopCount);

      _timerName = name;
      TimerService.createTimer(name, durations, $scope);

    };

    ctrl.start = function() {
      TimerService.start(_timerName);
    };

    ctrl.cancel = function() {
      TimerService.cancel(_timerName);
    };

  }

]);
