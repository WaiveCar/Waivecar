function ConnectionController($state,countdownEvents,$scope){
  this.timerName="connectingTimeLeft";
  this.$state=$state;
  $scope.$on(countdownEvents.counterStateFinished+'_'+this.timerName,function(){
    $state.go('dashboard');
  });
}

ConnectionController.prototype.getConnectionDurations = function() {
  return {'timeToConnect':.1};
};

ConnectionController.prototype.goToConnecting = function($state) {
  this.$state.go('cars-connecting',{'id':this.$state.params.id});
};
angular.module('app')
.controller('ConnectionController', [
  '$state',
  'countdownEvents',
  '$scope',
  ConnectionController
]);