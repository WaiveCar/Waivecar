(function() {

  var FREE_RIDE_STATUS='freeRide';
  var FREE_RIDE_ALERT_STATUS='freeRideAlert';
  var PAID_RIDE_STATUS='paidRide';
  var NEW_COUNTER_EVENT='waivecarCounterStarted';
  var COUNTER_CANCELLED_EVENT='waivecarCounterCancelled';
  var COUNTER_STATE_CHANGED_EVENT='waivecarCounterStateChanged';
  var COUNTER_STATE_FINISHED_EVENT='waivecarCounterStateFinnished';

  function TimerService($rootScope,$timeout) {
  	this.currentStatus=FREE_RIDE_STATUS;
  	this.durations={};
  	//In minutes
  	this.durations[FREE_RIDE_STATUS]=105;
  	this.durations[FREE_RIDE_ALERT_STATUS]=15;
  	this.durations[PAID_RIDE_STATUS]=-1;
  	this._scope=$rootScope;
  	this._timeout=$timeout;
  	this._timer;
  	this._timeCounterStarted;
  }
  TimerService.prototype.getEllapsedSeconds = function() {
  	var ellapsedSeconds=Math.round((new Date().getTime()-this._timeCounterStarted)/1000);
  	return ellapsedSeconds%60;
  };
  TimerService.prototype.getEllapsedMinutes = function() {
  	var ellapsedSeconds=Math.round((new Date().getTime()-this._timeCounterStarted)/1000);
  	return Math.floor(ellapsedSeconds/60)%60;
  };
  TimerService.prototype.getEllapsedHours = function() {
  	var ellapsedSeconds=Math.round((new Date().getTime()-this._timeCounterStarted)/1000);
  	return Math.floor(ellapsedSeconds/3600);
  };
  TimerService.prototype.cancel = function() {
  	this.cancelTimer();
  	var ellapsedSeconds=(new Date().getTime()-this._timeCounterStarted)/1000;
  	this._scope.$broadcast(COUNTER_CANCELLED_EVENT,this.getStatus(),this.getStatusDuration(),ellapsedSeconds);
  };
  TimerService.prototype.start = function() {
  	this._timeCounterStarted=new Date().getTime();
  	this._scope.$broadcast(NEW_COUNTER_EVENT,this.getStatus(),this.getStatusDuration());
  	this.startCounting();
  };
  TimerService.prototype.startCounting = function() {
  	this.cancelTimer();
  	var self=this;
  	var duration=this.getStatusDuration();
  	this._scope.$broadcast(COUNTER_STATE_CHANGED_EVENT,this.getStatus(),this.getStatusDuration());
  	if(duration>0){
  		this._timer=this._timeout(function(){
  			self._timerFinished();
  		},duration*60*1000);
  	}

  };
  TimerService.prototype._startNewEvent = function() {
  	this.nextStatus();
  	this.startCounting();
  };
  TimerService.prototype._timerFinished = function() {
  	this._scope.$broadcast(COUNTER_STATE_FINISHED_EVENT,this.getStatus(),this.getStatusDuration());
  	this._startNewEvent();
  };
  TimerService.prototype.cancelTimer = function() {
  	if (angular.isDefined(this._timer)) {
  		this._timeout.cancel(this._timer);
  		this._timer = undefined;
  	}
  };
  TimerService.prototype.getStatus=function(){
  	return this.currentStatus;
  };
  TimerService.prototype._setStatus=function(status){
  	this.currentStatus=status;
  };
  TimerService.prototype.getStatusDuration=function(){
  	return this.durations[this.getStatus()];
  };
  TimerService.prototype.nextStatus=function(){
  	switch(this.getStatus()) {
  		case FREE_RIDE_STATUS:
  			this._setStatus(FREE_RIDE_ALERT_STATUS);
  		break;
  		case FREE_RIDE_ALERT_STATUS:
  			this._setStatus(PAID_RIDE_STATUS);
  		break;
  	}
  	return this.getStatus();
  };
  TimerService.prototype.setDurations = function(durations) {
  	var allowedDurations=[FREE_RIDE_STATUS,FREE_RIDE_ALERT_STATUS,PAID_RIDE_STATUS];
  	var self=this;
  	allowedDurations.forEach(function(a){
  		self.durations[a]=durations[a];
  	});
  };

  angular.module('app')
  .service('Timer',[
    '$rootScope',
    '$timeout',
    TimerService
  ]);
})();