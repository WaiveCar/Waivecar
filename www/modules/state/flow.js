/**
* State service that allows the control of multiple state checks
* Each set of linear states must be registered as a flow using setStateFlow
*/
function FlowControlService($q) {
	this.$q = $q;
	this._flows = {};
}
FlowControlService.prototype.setStateFlow = function(flowName, states) {
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
	this._flows[flowName] = {
		states: states,
		currentStateIndex: -1,
		previousStateIndex: 0,
		_nameMap: stateNameMap,
		currentStateParams:{},
		previousStateParams:{}
	}
}
FlowControlService.prototype.getCurrentStateName = function(flowName) {
	var flow = this._getFlow(flowName);
	var index = flow.currentStateIndex;
	if(index<0){
		return null;
	}
	return flow.states[index].name || index;
};
FlowControlService.prototype.getCurrentStateParams = function(flowName) {
	var flow = this._getFlow(flowName);
	return flow.currentStateParams;
};
FlowControlService.prototype.getPreviousStatParams = function(flowName) {
	var flow = this._getFlow(flowName);
	return flow.previousStateParams;
};
FlowControlService.prototype.goTo = function(flowName, stateName,params) {
	var index=this.getStateIndexByName(flowName,stateName);
	return this._goToByIndex(flowName,index,params);
};
FlowControlService.prototype.hasRulesForTransition = function(flowName,stateName) {
	var flow = this._getFlow(flowName);
	var currentStateIndex=flow.currentStateIndex;
	var hasLeaveRule = true;
	if(currentStateIndex==-1){
		hasLeaveRule = false;
	}
	else{
		var stateRules=flow.states[currentStateIndex].rules;
		if(typeof stateRules=='undefined'
			&& typeof stateRules.leave =='undefined'){
			hasLeaveRule = false;
		}
	}
	if(!hasLeaveRule){
		var desiredStateIndex = this.getStateIndexByName(flowName,stateName);
		stateRules=flow.states[desiredStateIndex].rules;
		if(typeof stateRules=='undefined'
			&& typeof stateRules.arrive =='undefined'){
			return false;
		}
	}
	return true;
};
FlowControlService.prototype._goToByIndex = function(flowName,desiredIndex,params) {
	var flow = this._getFlow(flowName);
	var self=this;
	var stateName= flow.states[desiredIndex].name;
	return this._canLeaveStateIndex(flowName,flow.previousStateParams)
	.then(function(){
		return self._canGoToStateIndex(flowName,desiredIndex,params)
		.then(function(redirectState){
			if(redirectState!==true){
				flow.previousStateIndex =desiredIndex;
				flow.currentStateIndex = self.getStateIndexByName(flowName,redirectState);
				return redirectState;
			}
			flow.previousStateIndex = flow.currentStateIndex;
			flow.previousStateParams = flow.currentStateParams;
			flow.currentStateIndex = desiredIndex;
			flow.currentStateParams = params || {};

			return {name:stateName,params:params};
		},
		function(){
			return self.$q.reject(new Error ('The rules of '+stateName+' doesn\'t allow the arrival, current state: '+self.getCurrentStateName(flowName)));
		})

	},function(error){
		var currentStateName=self.getCurrentStateName(flowName);
		return self.$q.reject(new Error ('The rules of '+currentStateName+' doesn\'t allow leaving it right now'));
	});
	
};
FlowControlService.prototype._canLeaveStateIndex = function(flowName,params) {
	var flow = this._getFlow(flowName);
	var currentStateIndex=flow.currentStateIndex;
	if(currentStateIndex==-1){
		return this.$q.when(true);
	}
	var stateRules=flow.states[currentStateIndex].rules;
	if(typeof stateRules=='undefined'){
		return this.$q.when(true);
	}
	if(typeof stateRules.leave =='undefined'){
		return this.$q.when(true);
	}
	var self=this;
	return this.$q.when(stateRules.leave(params)).then(function(isAccepted){
		if(isAccepted){
			return true;
		}
		return self.$q.reject(isAccepted);
	});
};
FlowControlService.prototype._canGoToStateIndex = function(flowName,desiredStateIndex,params) {
	var currentStateName=this.getCurrentStateName(flowName);
	var flow = this._getFlow(flowName);
	var stateRules=flow.states[desiredStateIndex].rules;
	var self=this;
	if(typeof stateRules=='undefined'){
		return this.$q.when(true);
	}
	if(typeof stateRules.arrive =='undefined'){
		return this.$q.when(true);
	}
	return this.$q.when(stateRules.arrive(currentStateName,params)).then(function(isAccepted){
		if(isAccepted===true || typeof isAccepted ==='string'){
			return isAccepted;
		}
		return self.$q.reject(isAccepted);
	});
};
FlowControlService.prototype.canGoToState = function(flowName,stateName,params) {
	var flow = this._getFlow(flowName);
	var desiredStateIndex=this.getStateIndexByName(flowName,stateName);
	return this._canGoToStateIndex(flowName,desiredStateIndex,params);
};
FlowControlService.prototype.next = function(flowName,params) {
	var flow = this._getFlow(flowName);
	flow.previousStateIndex=flow.currentStateIndex;
	var nextIndex=flow.currentStateIndex+1;
	if(nextIndex>=flow.states.length){
		return this.$q.reject(new Error('Can\'t go to the next state the current state is the last'));
	}
	return this._goToByIndex(flowName,nextIndex,params);

};
FlowControlService.prototype.getStateIndexByName = function(flowName,stateName) {
	var flow = this._getFlow(flowName);
	return flow._nameMap[stateName];
};

FlowControlService.prototype.previous = function(flowName,params) {
	var flow = this._getFlow(flowName);
	flow.previousStateIndex=flow.currentStateIndex;
	if(flow.currentStateIndex==-1){
		return this.$q.reject(new Error('Can\'t go to the previous state the current state is the initial one (null)'));
	}
	if(flow.currentStateIndex==0){
		return this.$q.reject(new Error('Can\'t go to the previous state the current state is the first one'));
	}
	params = params || flow.previousStateParams;
	return this._goToByIndex(flowName,flow.currentStateIndex-1,params);
};
FlowControlService.prototype._getFlow = function(flowName) {
	return this._flows[flowName];
};
angular.module('FlowControl', [])
.service('FlowControlService', ['$q', FlowControlService]);