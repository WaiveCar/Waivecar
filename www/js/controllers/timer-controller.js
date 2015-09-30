'use strict';
var angular = require('angular');
require('../services/timer-service');

module.exports = angular.module('app.controllers').controller('TimerController', [
  '$scope',
  '$interval',
  'TimerService',
  'countdownEventsConstant',
  function TimerController($scope, $interval, TimerService, countdownEvents) {
    var minutes = 0;
    var seconds = 0;
    var hours = 0;
    // var status;
    var unbindList = [];
    var _timerName;
    var _stopInterval;
    var ctrl = this;

    function stopCount() {
      if (angular.isDefined(_stopInterval)) {
        $interval.cancel(_stopInterval);
        _stopInterval = void 0;
      }
    }
    ctrl.stopCount = stopCount;

    function startCount() {
      stopCount();
      // status = TimerService.getStatus(_timerName);
      var remainingTime = TimerService.getRemainingTime(_timerName);

      hours = remainingTime.hours;
      minutes = remainingTime.minutes;
      seconds = remainingTime.seconds;

      var intervalFunction = function () {
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 0;
          minutes = 0;
          seconds = 0;
          stopCount();
        }
      };
      _stopInterval = $interval(intervalFunction, 1000);

    }
    ctrl.startCount = startCount;

    $scope.$on('$destroy', function () {
      stopCount();
      unbindList.map(function (u) {
        u();
      });
    });

    function createTimer(name, durations) {
      var unbind;
      unbind = $scope.$on(countdownEvents.newCounter + '_' + name, startCount);
      unbindList.push(unbind);

      // unbind = $scope.$on(countdownEvents.counterStateChanged + '_' + name, function (ev, _status) {
      //   // status = _status;
      // });

      unbind = $scope.$on(countdownEvents.counterStateChanged + '_' + name, angular.identity);

      unbindList.push(unbind);

      unbind = $scope.$on(countdownEvents.counterCancelled + '_' + name, stopCount);

      _timerName = name;
      TimerService.createTimer(name, durations, $scope);

    }
    ctrl.createTimer = createTimer;

    function start() {
      TimerService.start(_timerName);
    }
    ctrl.start = start;

    function cancel() {
      TimerService.cancel(_timerName);
    }
    ctrl.cancel = cancel;

  }

]);
