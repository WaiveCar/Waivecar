var NEW_COUNTER_EVENT='waivecarCounterStarted';
var COUNTER_CANCELLED_EVENT='waivecarCounterCancelled';
var COUNTER_STATE_CHANGED_EVENT='waivecarCounterStateChanged';
var COUNTER_STATE_FINISHED_EVENT='waivecarCounterStateFinnished';
function TimerController($scope,$interval,timerService){
	var self=this;
	this.minutes=0;
	this.seconds=0;
	this.hours=0;
	this.status;
	this.timerService=timerService;
	this.$interval=$interval;
	this.scope=$scope;

	var unbindList=[];
	var unbind;
	unbind=$scope.$on(NEW_COUNTER_EVENT,function(){
		self.startCount();
	});	
	unbindList.push(unbind);

	unbind=$scope.$on(COUNTER_STATE_CHANGED_EVENT,function(ev,status){
		self.status=status;
	});	
	unbindList.push(unbind);

	unbind=$scope.$on(COUNTER_CANCELLED_EVENT,function(ev,status){
		self.stopCount();
	});	
	unbindList.push(unbind);
	$scope.$on("$destroy", function() {
        self.stopCount();
        unbindList.map(function(u){
        	u();
        })
    });
}
TimerController.prototype.start = function() {
	this.timerService.start();
};
TimerController.prototype.startCount=function(){
	this.status=this.timerService.getStatus();
	this.hours=this.timerService.getEllapsedHours();
	this.minutes=this.timerService.getEllapsedMinutes();
	this.seconds=this.timerService.getEllapsedSeconds();
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
	this.timerService.cancel();
};
angular.module('app.modules.countdown.controller',['app.modules.countdown.service'])
.controller('timerController',['$scope','$interval','timerService',TimerController])