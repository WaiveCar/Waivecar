function LicensesController($rootScope, $scope, DataService) {
  var self    = this;
  self.active = DataService.active;
}

angular.module('app')
.controller('LicensesController', [
  '$rootScope',
  '$scope',
  'DataService',
  LicensesController
]);