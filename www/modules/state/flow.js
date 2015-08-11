/**
* State service that allows the control of multiple state checks
* Each set of linear states must be registered as a flow using setStateFlow
*/
function FlowControlService($q) {
	this.$q = $q;
	this._flows = {};
}
FlowControlService.prototype.setStateFlow = function(flowName,states) {
	this._flows[flowName] = new Flow(states,this.$q);
	return this._flows[flowName];
}
FlowControlService.prototype._getFlow = function(flowName) {
	return this._flows[flowName];
};




Flow.prototype.getCurrentStateName = function() {
	var index = this.currentStateIndex;
	if(index<0){
		return null;
	}
	return this.states[index].name || index;
};
Flow.prototype.getCurrentStateParams = function() {
	return this.currentStateParams;
};

Flow.prototype.getPreviousStateParams = function() {
	return this.previousStateParams;
};
Flow.prototype.goTo = function(stateName,params) {
	var index=this.getStateIndexByName(stateName);
	return this._goToByIndex(index,params);
};
Flow.prototype.hasRulesForTransition = function(stateName) {
	var hasLeaveRule = true;
	if(this.currentStateIndex==-1){
		hasLeaveRule = false;
	}
	else{
		var stateRules=this.states[this.currentStateIndex].rules;
		if(typeof stateRules=='undefined'
			&& typeof stateRules.leave =='undefined'){
			hasLeaveRule = false;
		}
	}
	if(!hasLeaveRule){
		var desiredStateIndex = this.getStateIndexByName(stateName);
		stateRules=this.states[desiredStateIndex].rules;
		if(typeof stateRules=='undefined'
			&& typeof stateRules.arrive =='undefined'){
			return false;
		}
	}
	return true;
};
Flow.prototype._goToByIndex = function(desiredIndex,params) {
	var self=this;
	var stateName= this.states[desiredIndex].name;
	return this._canLeaveStateIndex(this.previousStateParams)
	.then(function(redirectState){
		if(redirectState!==true){
			if(typeof redirectState ==='string'){
				redirectState={name:redirectState,params:{}};
			}
			if(typeof redirectState==='object' && !!redirectState.name){
				redirectState.params= redirectState.params || {};
				redirectState.isRedirect = true;
				var redirectIndex = self.getStateIndexByName(redirectState.name);
				self.setStateIndex(redirectIndex,redirectState.params,desiredIndex,params || {});
				return redirectState;
			}
		}
		return self._canGoToStateIndex(desiredIndex,params)
		.then(function(redirectState){
			if(redirectState!==true){
				self.previousStateIndex =desiredIndex;
				if(typeof redirectState ==='string'){
					redirectState={name:redirectState,params:{}};
				}
				redirectState.params= redirectState.params || {};
				var redirectIndex = self.getStateIndexByName(redirectState.name);
				redirectState.isRedirect=true;
				self.setStateIndex(redirectIndex,redirectState.params,desiredIndex,params || {});
				return redirectState;
			}
			self.setStateIndex(desiredIndex,params);
			return {name:stateName,params:params};
		},
		function(){
			return self.$q.reject(new Error ('The rules of '+stateName+' doesn\'t allow the arrival, current state: '+self.getCurrentStateName()));
		})

	},function(error){
		var currentStateName=self.getCurrentStateName();
		return self.$q.reject(new Error ('The rules of '+currentStateName+' doesn\'t allow leaving it right now'));
	});
	
};
Flow.prototype.setState = function(stateName,stateParams) {
	var stateIndex = this.getStateIndexByName(stateName);
	this.setStateIndex(stateName,stateParams);
};
Flow.prototype.setStateIndex = function(desiredIndex,params,previousIndex,previousParams) {
	this.previousStateIndex = previousIndex || this.currentStateIndex;
	this.previousStateParams = previousParams || this.currentStateParams;
	this.currentStateIndex = desiredIndex;
	this.currentStateParams = params || {};
};
Flow.prototype._canLeaveStateIndex = function(params) {
	var currentStateIndex=this.currentStateIndex;
	if(currentStateIndex==-1){
		return this.$q.when(true);
	}
	var stateRules=this.states[currentStateIndex].rules;
	if(typeof stateRules=='undefined'){
		return this.$q.when(true);
	}
	if(typeof stateRules.leave =='undefined'){
		return this.$q.when(true);
	}
	var self=this;
	return this.$q.when(stateRules.leave(params)).then(function(isAccepted){
		if(isAccepted!==false){
			return isAccepted;
		}
		return self.$q.reject(isAccepted);
	});
};
Flow.prototype._canGoToStateIndex = function(desiredStateIndex,params) {
	var currentStateName=this.getCurrentStateName();
	var stateRules=this.states[desiredStateIndex].rules;
	var self=this;
	if(typeof stateRules=='undefined'){
		return this.$q.when(true);
	}
	if(typeof stateRules.arrive =='undefined'){
		return this.$q.when(true);
	}
	return this.$q.when(stateRules.arrive(currentStateName,params)).then(function(isAccepted){
		if(isAccepted!==false){
			return isAccepted;
		}
		return self.$q.reject(isAccepted);
	});
};
Flow.prototype.canGoToState = function(stateName,params) {
	var flow = this._getFlow();
	var desiredStateIndex=this.getStateIndexByName(stateName);
	return this._canGoToStateIndex(desiredStateIndex,params);
};
Flow.prototype.next = function(params) {
	this.previousStateIndex=this.currentStateIndex;
	var nextIndex=this.currentStateIndex+1;
	if(nextIndex>=this.states.length){
		return this.$q.reject(new Error('Can\'t go to the next state the current state is the last'));
	}
	return this._goToByIndex(nextIndex,params);

};
Flow.prototype.getStateIndexByName = function(stateName) {
	return this._nameMap[stateName];
};

Flow.prototype.previous = function(params) {
	this.previousStateIndex=this.currentStateIndex;
	if(this.currentStateIndex==-1){
		return this.$q.reject(new Error('Can\'t go to the previous state the current state is the initial one (null)'));
	}
	if(this.currentStateIndex==0){
		return this.$q.reject(new Error('Can\'t go to the previous state the current state is the first one'));
	}
	params = params || this.previousStateParams;
	return this._goToByIndex(this.currentStateIndex-1,params);
};


function Flow(states,$q){
	this.$q= $q;
	var stateNameMap = {};
	var count = 0;
	var name;
	states.forEach(function(s) {
		name = s.name || count;
		if (typeof stateNameMap[name] != 'undefined') {
			throw new Error('The state ' + name + ' already exists');
		}
		stateNameMap[name] = count;
		count ++ ;
	});
	this.states=  states;
	this.currentStateIndex=  -1;
	this.previousStateIndex=  0;
	this._nameMap=  stateNameMap;
	this.currentStateParams= {};
	this.previousStateParams= {};
}
angular.module('FlowControl', [])
.service('FlowControlService', ['$q', FlowControlService]);