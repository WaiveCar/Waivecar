(function() {
  var NEW_COUNTER_EVENT='waivecarCounterStarted';
  var COUNTER_CANCELLED_EVENT='waivecarCounterCancelled';
  var COUNTER_STATE_CHANGED_EVENT='waivecarCounterStateChanged';
  var COUNTER_STATE_FINISHED_EVENT='waivecarCounterStateFinnished';

  function TimerController($scope, $interval, Timer) {
  	var self=this;
  	this.minutes=0;
  	this.seconds=0;
  	this.hours=0;
  	this.status;
  	this.timerService = Timer;
  	this.$interval=$interval;
  	this.$scope=$scope;
  	this.unbindList=[];
    
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
    unbind=this.$scope.$on(NEW_COUNTER_EVENT+"_"+name,function(){
      self.startCount();
    });
    this.unbindList.push(unbind);

    unbind=this.$scope.$on(COUNTER_STATE_CHANGED_EVENT+"_"+name,function(ev,status){
      self.status=status;
    });
    this.unbindList.push(unbind);

    this.unbind=this.$scope.$on(COUNTER_CANCELLED_EVENT+"_"+name,function(ev,status){
      self.stopCount();
    });
    this._timerName=name;
    this.timerService.createTimer(name,durations);
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

  angular.module('app')
  .controller('TimerController',[
    '$scope',
    '$interval',
    'Timer',
    TimerController
  ]);
})();