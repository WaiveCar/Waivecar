function StateService(){
	this._flows={};
}
StateService.prototype.setStateFlow = function(flowName,rules) {
	this._flows[flowName]={
		rules:rules,
		currentStateIndex:0
	}
}
StateService.prototype.getCurrentState = function(flowName) {
	var rules=this._flows[flowName].rules;
	var index=this._flows[flowName].currentStateIndex;
	return rules[index].name || index;
};
angular.module('State',[])
.service('StateService',[StateService]);