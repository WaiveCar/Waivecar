function FleetRulesService($timeout){
	this.$timeout=$timeout;
}
FleetRulesService.prototype.getRules = function() {
	return {
		arrive:function(){
		}
	}
};
// angular.module('WaiveCar.state')
// .service('FleetRulesService', [
// '$timeout',
//   FleetRulesService
// ])