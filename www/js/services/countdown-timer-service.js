'use strict';
var angular = require('angular');

module.exports = angular.module('app.services').factory('CountdownTimer', [
  '$timeout',
  'countdownEventsConstant',
  'timerStatesConstant',
  function countdownFactory($timeout, countdownEvents, timerStates) {

    function CountdownTimer(name, durations, scope, rootScope) {

      this._setDurations(durations);
      this._timeout = $timeout;
      this._name = name;
      this._scope = scope;
      this.countdownEvents = countdownEvents;
      this._state = timerStates.stopped;
      this._rootScope = rootScope;
    }

    CountdownTimer.prototype.isStarted = function () {
      return this._state === timerStates.started;
    };

    CountdownTimer.prototype._setDurations = function (durations) {
      this._statusNames = Object.keys(durations);
      this.currentStatus = this._statusNames[0];
      this._statusLength = this._statusNames.length;
      this.durations = durations;
      this._statusIndex = 0;
    };

    CountdownTimer.prototype._getTotalSeconds = function () {
      return Math.round((new Date().getTime() - this._timeCounterStarted) / 1000);
    };

    CountdownTimer.prototype.getEllapsedSeconds = function () {
      var totalSeconds = this._getTotalSeconds();
      return totalSeconds % 60;
    };

    CountdownTimer.prototype.getEllapsedMinutes = function () {
      var totalSeconds = this._getTotalSeconds();
      return Math.floor(totalSeconds / 60) % 60;
    };

    CountdownTimer.prototype.getEllapsedHours = function () {
      var totalSeconds = this._getTotalSeconds();
      return Math.floor(totalSeconds / 3600);
    };

    CountdownTimer.prototype.getRemainingTime = function () {
      var currentRemainingTime = this._currentDurationInSecods - this._getTotalSeconds();
      var hours = Math.floor(currentRemainingTime / 3600);
      currentRemainingTime -= (hours * 3600);
      var minutes = Math.floor(currentRemainingTime / 60);
      currentRemainingTime -= (minutes * 60);
      var seconds = currentRemainingTime;
      return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
      };

    };

    CountdownTimer.prototype.cancel = function () {
      if (!this.isStarted()) {
        return;
      }
      this.cancelTimer();
      this._state = timerStates.stopped;
      var ellapsedSeconds = (new Date().getTime() - this._timeCounterStarted) / 1000;
      var eventName = this.countdownEvents.counterCancelled + '_' + this._name;
      this._rootScope.$broadcast(eventName, this.getStatus(), this.getStatusDuration(), ellapsedSeconds);

    };

    CountdownTimer.prototype.start = function () {
      var eventName = this.countdownEvents.newCounter + '_' + this._name;
      if (this.isStarted()) {
        this._rootScope.$broadcast(eventName, this.getStatus(), this.getStatusDuration());
        eventName = this.countdownEvents.counterStateChanged + '_' + this._name;
        this._rootScope.$broadcast(eventName, this.getStatus(), this.getStatusDuration());
        return;
      }

      this._state = timerStates.started;
      this._timeCounterStarted = new Date().getTime();
      this._currentDurationInSecods = this.getStatusDuration() * 60;

      this._rootScope.$broadcast(eventName, this.getStatus(), this.getStatusDuration());
      this.startCounting();

    };

    CountdownTimer.prototype.startCounting = function () {
      this.cancelTimer();
      var self = this;
      var duration = this.getStatusDuration();

      var eventName = this.countdownEvents.counterStateChanged + '_' + this._name;
      this._rootScope.$broadcast(eventName, this.getStatus(), this.getStatusDuration());
      if (duration > 0) {
        this._timer = this._timeout(function () {
          self._timerFinished();
        }, duration * 60 * 1000);
      }

    };
    CountdownTimer.prototype._startNewEvent = function () {
      this.nextStatus();
      this.startCounting();
    };

    CountdownTimer.prototype._timerFinished = function () {
      var eventName = this.countdownEvents.counterStateFinished + '_' + this._name;
      this._state = timerStates.stopped;
      this._rootScope.$broadcast(eventName, this.getStatus(), this.getStatusDuration());
      this._startNewEvent();

    };

    CountdownTimer.prototype.cancelTimer = function () {
      if (angular.isDefined(this._timer)) {
        this._timeout.cancel(this._timer);
        this._timer = void 0;
      }

    };

    CountdownTimer.prototype.getStatus = function () {
      return this.currentStatus;
    };

    CountdownTimer.prototype._setStatus = function (status) {
      this.currentStatus = status;
    };

    CountdownTimer.prototype.getStatusDuration = function () {
      return this.durations[this.getStatus()];
    };

    CountdownTimer.prototype.nextStatus = function () {
      this._statusIndex = (this._statusIndex + 1) % this._statusLength;
      this._setStatus(this._statusNames[this._statusIndex]);
      this._currentDurationInSecods = this.getStatusDuration() * 60;
      return this.getStatus();

    };

    CountdownTimer.prototype.setDurations = function (durations) {
      this._setDurations(durations);
    };

    return CountdownTimer;

  }

]);
