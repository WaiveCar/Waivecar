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
  var states = this._flows[flowName].states;
  var index = this._flows[flowName].currentStateIndex;
  return states[index].name || index;
};
StateService.prototype.goTo = function(flowName, stateName) {
  var flow = this._flows[flowName];
  var stateIndex = flow._nameMap[stateName];
  this._flows[flowName].currentStateIndex = stateIndex;
  this.$state.go(stateName);
};
angular.module('State', [])
.service('StateService', ['$state', StateService]);