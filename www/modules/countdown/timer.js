(function() {
  function countdownFactory($timeout,countdownEvents){
     function CountdownTimer(name,durations,scope){

        this._setDurations(durations);
        this._timeout=$timeout;
        this._timer;
        this._name=name;
        this._timeCounterStarted;
        this._scope=scope;
        this._currentDurationInSecods;
        this.countdownEvents=countdownEvents;
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
        var eventName=this.countdownEvents.counterCancelled+"_"+this._name;
        this._scope.$broadcast(eventName,this.getStatus(),this.getStatusDuration(),ellapsedSeconds);
      };
      CountdownTimer.prototype.start = function() {
        this._timeCounterStarted=new Date().getTime();
        var eventName=this.countdownEvents.newCounter+"_"+this._name;
        this._currentDurationInSecods=this.getStatusDuration()*60;

        this._scope.$broadcast(eventName,this.getStatus(),this.getStatusDuration());
        this.startCounting();
      };
       CountdownTimer.prototype.startCounting = function() {
        this.cancelTimer();
        var self=this;
        var duration=this.getStatusDuration();

        var eventName=this.countdownEvents.counterStateChanged+"_"+this._name;
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
        var eventName= this.countdownEvents.counterStateFinished+"_"+this._name;
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
        this._statusIndex=(this._statusIndex+1)%this._statusLength;
        this._setStatus(this._statusNames[this._statusIndex]);
        this._currentDurationInSecods=this.getStatusDuration()*60;
        return this.getStatus();
      };
      CountdownTimer.prototype.setDurations = function(durations) {
        this._setDurations(durations);
      };
    return CountdownTimer;
  }

  function TimerService($rootScope,$timeout,countdownEvents,CountdownTimer) {
    this._timerInstances={};
    this.$rootScope=$rootScope;
    this.$timeout=$timeout;
    this.countdownEvents=countdownEvents;
    this.CountdownTimer;
  }
  TimerService.prototype.createTimer=function(timerName,durations,scope){
    this._timerInstances[timerName]=new this.CountdownTimer(timerName,durations,scope);
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
 

  function TimerController($scope, $interval, Timer,countdownEvents) {
    var self=this;
    this.minutes=0;
    this.seconds=0;
    this.hours=0;
    this.status;
    this.timerService = Timer;
    this.$interval=$interval;
    this.$scope=$scope;
    this.unbindList=[];
    this.countdownEvents=countdownEvents;
    
    $scope.$on("$destroy", function() {
          self.stopCount();
          self.unbindList.map(function(u){
            u();
          })
      });
  }
  TimerController.prototype.createTimer = function(name,durations) {
    var unbind;
    var self=this;
    unbind=this.$scope.$on(this.countdownEvents.newCounter+"_"+name,function(){
      self.startCount();
    });
    this.unbindList.push(unbind);

    unbind=this.$scope.$on(this.countdownEvents.counterStateChanged+"_"+name,function(ev,status){
      self.status=status;
    });
    this.unbindList.push(unbind);

    this.unbind=this.$scope.$on(this.countdownEvents.counterCancelled+"_"+name,function(ev,status){
      self.stopCount();
    });
    this._timerName=name;
    this.timerService.createTimer(name,durations,this.$scope);
  };
  TimerController.prototype.start = function() {
    this.timerService.start(this._timerName);
  };
  TimerController.prototype.startCount=function(){
    this.stopCount();
    this.status=this.timerService.getStatus(this._timerName);
    var remainingTime=this.timerService.getRemainingTime(this._timerName);

    this.hours=remainingTime.hours;
    this.minutes=remainingTime.minutes;
    this.seconds=remainingTime.seconds;
    var self=this;

    var intervalFunction=function(){
      self.seconds--;
      if(self.seconds<0){
        self.seconds=59;
        self.minutes--;
      }
      if(self.minutes<0){
        self.minutes=59;
        self.hours--;
      }
      if(self.hours<0){
        self.hours=0;
        self.minutes=0;
        self.seconds=0;
        self.stopCount();
      }
    }
    this._stopInterval = this.$interval(intervalFunction, 1000);
  }
  TimerController.prototype.stopCount = function() {
    if (angular.isDefined(this._stopInterval)) {
      this.$interval.cancel(this._stopInterval);
      this._stopInterval = undefined;
    }
  };
  TimerController.prototype.cancel = function() {
    this.timerService.cancel(this._timerName);
  };

  angular.module('countdown',[])
  .constant('countdownEvents',{
      newCounter:'waivecarCounterStarted',
      counterCancelled:'waivecarCounterCancelled'  ,
      counterStateChanged:'waivecarCounterStateChanged',
      counterStateFinished:'waivecarCounterStateFinnished'
  })
  .factory('CountdownTimer',[
    '$timeout',
    'countdownEvents',
    countdownFactory
  ])
  .service('TimerService',[
    '$rootScope',
    '$timeout',
    'countdownEvents',
    'CountdownTimer',
    TimerService
  ])
  .controller('TimerController',[
    '$scope',
    '$interval',
    'TimerService',
    'countdownEvents',
    TimerController
  ]);
})();