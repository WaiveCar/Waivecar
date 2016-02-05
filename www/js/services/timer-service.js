'use strict';
var angular = require('angular');
require('./countdown-timer-service');

module.exports = angular.module('app.services').factory('TimerService', [
  '$rootScope',
  '$timeout',
  'countdownEventsConstant',
  'CountdownTimer',
  function ($rootScope, $timeout, countdownEvents, CountdownTimer) {
    var _timerInstances = {};

    function createTimer(timerName, durations, scope) {
      /**
       *@todo better timer lifecycle
       */
      if (_timerInstances[timerName] && _timerInstances[timerName].isStarted()) {
        // console.log("Giving the same timer " + timerName);
        return _timerInstances[timerName];
      }
      // console.log("Creating new " + timerName);

      _timerInstances[timerName] = new CountdownTimer(timerName, durations, scope, $rootScope);

    }

    function getRemainingTime(timerName) {
      return _timerInstances[timerName].getRemainingTime();
    }

    function cancel(timerName) {
      _timerInstances[timerName].cancel();
    }

    function start(timerName) {
      _timerInstances[timerName].start();
    }

    function startCounting(timerName) {
      _timerInstances[timerName].startCounting();
    }

    function cancelTimer(timerName) {
      _timerInstances[timerName].cancelTimer();
    }

    function getStatus(timerName) {
      return _timerInstances[timerName].getStatus();
    }

    function getStatusDuration(timerName) {
      return _timerInstances[timerName].getStatusDuration();
    }

    function nextStatus(timerName) {
      return _timerInstances[timerName].nextStatus();
    }

    function setDurations(timerName, durations) {
      _timerInstances[timerName].setDurations(durations);
    }

    return {
      createTimer: createTimer,
      getRemainingTime: getRemainingTime,
      cancel: cancel,
      start: start,
      startCounting: startCounting,
      cancelTimer: cancelTimer,
      getStatus: getStatus,
      getStatusDuration: getStatusDuration,
      nextStatus: nextStatus,
      setDurations: setDurations
    };

  }
]);
