/**
* State service that allows the control of multiple state checks
* Each set of linear states must be registered as a flow using setStateFlow
*/
function StateService($state) {
	this.$state = $state;
	this._flows = {};
}
StateService.prototype.setStateFlow = function(flowName, states) {
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
		currentStateIndex: 0,
		previousStateIndex: 0,
		_nameMap: stateNameMap
	}
}
StateService.prototype.getCurrentState = function(flowName) {
	var flow = this._getFlow(flowName);
	var states = flow.states;
	var index = flow.currentStateIndex;
	return states[index].name || index;
};
StateService.prototype.goTo = function(flowName, stateName) {
	var index=this.getStateIndexByName(flowName,stateName);
	this._goToByIndex(flowName,index);
};
StateService.prototype._goToByIndex = function(flowName,desiredIndex) {
	var flow = this._getFlow(flowName);
	var stateName= flow.states[desiredIndex].name;
	if(!this._canGoToStateIndex(flowName,desiredIndex)){
		throw new Error ('The rules of '+stateName+' doesn\'t allow the arrival, current state: '+flow.states[flow.currentStateIndex].name);
	}
	flow.previousStateIndex = flow.currentStateIndex;
	flow.currentStateIndex = desiredIndex;
	this.$state.go(stateName);
	
};
StateService.prototype._canGoToStateIndex = function(flowName,desiredStateIndex) {
	var currentStateName=this.getCurrentState(flowName);
	var flow = this._getFlow(flowName);
	var stateRules=flow.states[desiredStateIndex].rules;
	if(typeof stateRules=='undefined'){
		return true;
	}
	if(typeof stateRules.arrive =='undefined'){
		return true;
	}
	return stateRules.arrive(currentStateName);
};
StateService.prototype.canGoToState = function(flowName,stateName) {
	var flow = this._getFlow(flowName);
	var desiredStateIndex=this.getStateIndexByName(flowName,stateName);
	return this._canGoToStateIndex(flowName,desiredStateIndex);
};
StateService.prototype.next = function(flowName) {
	var flow = this._getFlow(flowName);
	flow.previousStateIndex=flow.currentStateIndex;
	var nextIndex=flow.currentStateIndex+1;
	if(nextIndex>=flow.states.length){
		throw new Error('Can\'t go to the next state the current state is the last');
	}
	this._goToByIndex(flowName,nextIndex);

};
StateService.prototype.getStateIndexByName = function(flowName,stateName) {
	var flow = this._getFlow(flowName);
	return flow._nameMap[stateName];
};

StateService.prototype.previous = function(flowName) {
	var flow = this._getFlow(flowName);
	flow.previousStateIndex=flow.currentStateIndex;
	if(flow.currentStateIndex==0){
		throw new Error('Can\'t go to the previous state the current state is the first one');
	}
	this._goToByIndex(flowName,flow.currentStateIndex-1);
};
StateService.prototype._getFlow = function(flowName) {
	return this._flows[flowName];
};
angular.module('State', [])
.service('StateService', ['$state', StateService]);