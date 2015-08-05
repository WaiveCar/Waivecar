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
	var flow = this._getFlow(flowName);
	var stateIndex = this.getStateIndexByName(flowName,stateName)
	if(!this.canGoToState(flowName,stateName)){
		throw new Error ('The rules of '+stateName+' doesn\'t allow the arrival, current state: '+this.getCurrentState(flowName));
	}
	flow.currentStateIndex = stateIndex;
	this.$state.go(stateName);
};
StateService.prototype.canGoToState = function(flowName,stateName) {
	var flow = this._getFlow(flowName);
	var desiredStateIndex=this.getStateIndexByName(flowName,stateName);
	var currentStateName=this.getCurrentState(flowName);
	var stateRules=flow.states[desiredStateIndex].rules;
	if(typeof stateRules=='undefined'){
		return true;
	}
	if(typeof stateRules.arrive =='undefined'){
		return true;
	}
	return stateRules.arrive(currentStateName);
};
StateService.prototype.next = function(flowName) {
	var flow = this._getFlow(flowName);
	var nextIndex=flow.currentStateIndex+1;
	if(nextIndex>=flow.states.length){
		throw new Error('Can\'t go to the next state the current state is the last');
	}
	var stateName=flow.states[nextIndex].name;
	if(!this.canGoToState(flowName,stateName)){
		throw new Error ('The rules of '+stateName+' doesn\'t allow the arrival, current state: '+this.getCurrentState(flowName));
	}
	flow.currentStateIndex = nextIndex;
	this.goTo(flowName,stateName);

};
StateService.prototype.getStateIndexByName = function(flowName,stateName) {
	var flow = this._getFlow(flowName);
	return flow._nameMap[stateName];
};

StateService.prototype.previous = function(flowName) {
	var flow = this._getFlow(flowName);
	if(flow.currentStateIndex==0){
		throw new Error('Can\'t go to the previous state the current state is the first one');
	}
	flow.currentStateIndex--;
	var stateName=this.getCurrentState(flowName);
	this.goTo(flowName,stateName);
};
StateService.prototype._getFlow = function(flowName) {
	return this._flows[flowName];
};
angular.module('State', [])
.service('StateService', ['$state', StateService]);