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
  	this.scope=$scope;
  	this.unbindList=[];
  
  	unbindList.push(unbind);
  	$scope.$on("$destroy", function() {
          self.stopCount();
          self.unbindList.map(function(u){
          	u();
          })
      });
  }
  TimerController.prototype.createTimer = function(name) {
    var unbind;
    var self=this;
    unbind=$scope.$on(NEW_COUNTER_EVENT+"_"+name,function(){
      self.startCount();
    });
    this.unbindList.push(unbind);

    unbind=$scope.$on(COUNTER_STATE_CHANGED_EVENT+"_"+name,function(ev,status){
      self.status=status;
    });
    this.unbindList.push(unbind);

    this.unbind=$scope.$on(COUNTER_CANCELLED_EVENT+"_"+name,function(ev,status){
      self.stopCount();
    });
    this._timerName=name;
    this.timerService.createTimer(name);
  };
  TimerController.prototype.start = function() {
  	this.timerService.start(this._timerName);
  };
  TimerController.prototype.startCount=function(){
  	this.status=this.timerService.getStatus(this._timerName);
  	this.hours=this.timerService.getEllapsedHours(this._timerName);
  	this.minutes=this.timerService.getEllapsedMinutes(this._timerName);
  	this.seconds=this.timerService.getEllapsedSeconds(this._timerName);
  	var self=this;
  	var intervalFunction=function(){
  		self.seconds++;
  		if(self.seconds>=60){
  			self.seconds=0;
  			self.minutes++;
  		}
  		if(self.minutes>=60){
  			self.minutes=0;
  			self.hours++;
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