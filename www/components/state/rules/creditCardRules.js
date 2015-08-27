function CreditCardRules($q){
	this.$q=$q;

}
CreditCardRules.prototype.getRules = function() {
	var self=this;
	return {
		leave:function(){
			return 'fleet';
		}
	}
};

angular.module('WaiveCar.state.creditCardRules',[])
.service('CreditCardRules', [
	'$q',
  	CreditCardRules
]);
