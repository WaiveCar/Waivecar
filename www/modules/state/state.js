function StateService(){
	this._flows={};
}
StateService.prototype.setStateFlow = function(flowName,rules) {
	this._flows[flowName]=rules;
}
angular.module('State',[])
.service('StateService',[StateService]);