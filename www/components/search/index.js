function SearchController($rootScope, $scope, Vehicles) {
  var self = this;
  self.vehicles = Vehicles.query();
}

angular.module('app')
.controller('SearchController', [
  '$rootScope',
  '$scope',
  'Vehicles',
  SearchController
]);