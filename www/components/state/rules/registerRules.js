function RegisterRulesService($q){
	this.$q=$q;

}
RegisterRulesService.prototype.getRules = function() {
	var self=this;
	return {
		leave:function(){
			return 'license-photo';
		}
	}
};

angular.module('WaiveCar.state.registerRules',[])
.service('RegisterRulesService', [
	'$q',
  	RegisterRulesService
]);
