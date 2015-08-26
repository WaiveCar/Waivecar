function SignInRulesService($q){
	this.$q=$q;

}
SignInRulesService.prototype.getRules = function() {
	var self=this;
	return {
		// leave:function(){
		// 	return 'fleet';
		// }
	}
};

angular.module('WaiveCar.state.signInRules',[])
.service('SignInRulesService', [
	'$q',
  	SignInRulesService
]);
