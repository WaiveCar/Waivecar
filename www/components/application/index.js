function ApplicationController($rootScope, $scope, $ionicPopover) {

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
}

angular.module('app')
.controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$ionicPopover',
  ApplicationController
]);