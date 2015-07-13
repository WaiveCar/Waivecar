(function() {

  var NEW_COUNTER_EVENT='waivecarCounterStarted';
  var COUNTER_CANCELLED_EVENT='waivecarCounterCancelled';
  var COUNTER_STATE_CHANGED_EVENT='waivecarCounterStateChanged';
  var COUNTER_STATE_FINISHED_EVENT='waivecarCounterStateFinnished';

  function CountdownTimer(name,durations,$rootScope,$timeout){
    this._setDurations(durations);
    this._timeout=$timeout;
    this._timer;
    this._name=name;
    this._timeCounterStarted;
    this._scope=$rootScope;
    this._currentDurationInSecods;
  }
  CountdownTimer.prototype._setDurations = function(durations) {
    this._statusNames=Object.keys(durations);
    this.currentStatus=this._statusNames[0];
    this._statusLength=this._statusNames.length;
    this.durations=durations;
    this._statusIndex=0;
  };
  CountdownTimer.prototype._getTotalSeconds = function() {
    return  Math.round((new Date().getTime()-this._timeCounterStarted)/1000);
  };
  CountdownTimer.prototype.getEllapsedSeconds = function() {
  	var totalSeconds=this._getTotalSeconds();
  	return totalSeconds%60;
  };
  CountdownTimer.prototype.getEllapsedMinutes = function() {
  	var totalSeconds=this._getTotalSeconds();
  	return Math.floor(totalSeconds/60)%60;
  };
  CountdownTimer.prototype.getEllapsedHours = function() {
  	var totalSeconds=this._getTotalSeconds();
  	return Math.floor(totalSeconds/3600);
  };
  CountdownTimer.prototype.getRemainingTime = function() {
    var currentRemainingTime=this._currentDurationInSecods-this._getTotalSeconds();
    var hours=Math.floor(currentRemainingTime/3600);
    currentRemainingTime-=(hours*3600);
    var minutes=Math.floor(currentRemainingTime/60);
    currentRemainingTime-=(minutes*60);
    var seconds=currentRemainingTime;
    return {
      hours:hours,
      minutes:minutes,
      seconds:seconds
    }
  };
 
  CountdownTimer.prototype.cancel = function() {
  	this.cancelTimer();
  	var ellapsedSeconds=(new Date().getTime()-this._timeCounterStarted)/1000;
    var eventName=COUNTER_CANCELLED_EVENT+"_"+this._name;
  	this._scope.$broadcast(eventName,this.getStatus(),this.getStatusDuration(),ellapsedSeconds);
  };
  CountdownTimer.prototype.start = function() {
  	this._timeCounterStarted=new Date().getTime();
    var eventName=NEW_COUNTER_EVENT+"_"+this._name;
    this._currentDurationInSecods=this.getStatusDuration()*60;

  	this._scope.$broadcast(eventName,this.getStatus(),this.getStatusDuration());
  	this.startCounting();
  };
   CountdownTimer.prototype.startCounting = function() {
    this.cancelTimer();
    var self=this;
    var duration=this.getStatusDuration();

    var eventName=COUNTER_STATE_CHANGED_EVENT+"_"+this._name;
    this._scope.$broadcast(eventName,this.getStatus(),this.getStatusDuration());
    if(duration>0){
      this._timer=this._timeout(function(){
        self._timerFinished();
      },duration*60*1000);
    }

  };
  CountdownTimer.prototype._startNewEvent = function() {
    this.nextStatus();
    this.startCounting();
  };
  CountdownTimer.prototype._timerFinished = function() {
    var eventName=COUNTER_STATE_FINISHED_EVENT+"_"+this._name;
    this._scope.$broadcast(eventName,this.getStatus(),this.getStatusDuration());
    this._startNewEvent();
  };
  CountdownTimer.prototype.cancelTimer = function() {
    if (angular.isDefined(this._timer)) {
      this._timeout.cancel(this._timer);
      this._timer = undefined;
    }
  };
  CountdownTimer.prototype.getStatus=function(){
    return this.currentStatus;
  };
  CountdownTimer.prototype._setStatus=function(status){
    this.currentStatus=status;
  };
  CountdownTimer.prototype.getStatusDuration=function(){
    return this.durations[this.getStatus()];
  };
  CountdownTimer.prototype.nextStatus=function(){
    this._statusIndex=this._statusIndex++%this._statusLength;
    this._setStatus(this._statusNames[this._statusIndex]);
    this._currentDurationInSecods=this.getStatusDuration()*60;
    return this.getStatus();
  };
  CountdownTimer.prototype.setDurations = function(durations) {
    this._setDurations(durations);
  };


  function TimerService($rootScope,$timeout) {
    this._timerInstances={};
    this.$rootScope=$rootScope;
    this.$timeout=$timeout;
  }
  TimerService.prototype.createTimer=function(timerName,durations){
    this._timerInstances[timerName]=new CountdownTimer(timerName,durations,this.$rootScope,this.$timeout);
  }
  TimerService.prototype.getEllapsedSeconds=function(timerName){
   return  this._timerInstances[timerName].getEllapsedSeconds();
  }
  TimerService.prototype.getEllapsedMinutes=function(timerName){
    return this._timerInstances[timerName].getEllapsedMinutes();
  }
  TimerService.prototype.getEllapsedHours=function(timerName){
    return this._timerInstances[timerName].getEllapsedHours();
  }
  TimerService.prototype.getRemainingTime=function(timerName){
   return  this._timerInstances[timerName].getRemainingTime();
  }
  
  TimerService.prototype.cancel=function(timerName){
    this._timerInstances[timerName].cancel();
  }
  TimerService.prototype.start=function(timerName){
    this._timerInstances[timerName].start();
  }
  TimerService.prototype.startCounting=function(timerName){
    this._timerInstances[timerName].startCounting();
  }
  TimerService.prototype.cancelTimer=function(timerName){
    this._timerInstances[timerName].cancelTimer();
  }
  TimerService.prototype.getStatus=function(timerName){
    return this._timerInstances[timerName].getStatus();
  }
  TimerService.prototype.getStatusDuration=function(timerName){
    return this._timerInstances[timerName].getStatusDuration();
  }
  TimerService.prototype.nextStatus=function(timerName){
   return  this._timerInstances[timerName].nextStatus();
  }
  TimerService.prototype.setDurations=function(timerName,durations){
    this._timerInstances[timerName].setDurations(durations);
  }
 
  angular.module('app')
  .service('Timer',[
    '$rootScope',
    '$timeout',
    TimerService
  ]);
})();