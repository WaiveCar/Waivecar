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
	var stateIndex = flow._nameMap[stateName];
	flow.currentStateIndex = stateIndex;
	this.$state.go(stateName);
};
StateService.prototype.next = function(flowName) {
	var flow = this._getFlow(flowName);
	var nextIndex=flow.currentStateIndex+1;
	if(nextIndex>=flow.states.length){
		throw new Error('Can\'t go to the next state the current state is the last');
	}
	flow.currentStateIndex = nextIndex;
	var stateName=this.getCurrentState(flowName);
	this.goTo(flowName,stateName);

};

StateService.prototype.previous = function(flowName) {
	var flow = this._getFlow(flowName);
	if(flow.currentStateIndex==0){
		throw new Error("Can\'t go to the previous state the current state is the first one");
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