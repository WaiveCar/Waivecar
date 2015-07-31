function CreditCardsController($rootScope, $scope, DataService) {
  var self         = this;
  self.active      = DataService.active;
}

angular.module('app')
.controller('CreditCardsController', [
  '$rootScope',
  '$scope',
  '$state',
  'DataService',
  CreditCardsController
]);