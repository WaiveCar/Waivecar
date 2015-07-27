function ApplicationController($rootScope, $scope, $ionicPopover, Cars, Data,$q) {
  var self = this;

  $ionicPopover.fromTemplateUrl('components/menu/templates/index.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.showNav = function($event) {
    $scope.popover.show($event);
  }

  $scope.hideNav = function() {
    $scope.popover.hide();
  }

  self.init = function() {
    var defered=$q.defer();
    Data.models.cars=Cars.query();
  }

  self.init();
}

angular.module('app')
.controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$ionicPopover',
  'Cars',
  'Data',
  '$q',
  ApplicationController
]);
