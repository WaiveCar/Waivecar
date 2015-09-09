function BookingRulesService($q,DataService){
	this.$q=$q;
	this.DataService=DataService;
}
BookingRulesService.prototype.getRules = function() {
	var self=this;
	return {
		leave:function(){
			//It can't leave the booking without an active booking
			if(!this.DataService.active.bookings){
				return false;
			}
			return true;
		}
	}
};

angular.module('WaiveCar.state.bookingRules',[])
.service('BookingRulesService', [
	'$q',
	'DataService',
  	BookingRulesService
]);
