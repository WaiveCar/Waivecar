function ApplicationController($rootScope, $scope, $ionicPopover, AuthService, DataService) {
  var self = this;

  $ionicPopover.fromTemplateUrl('components/menu/templates/index.html', {
    scope: $scope
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $rootScope.$on('authError', function() {
    AuthService.logout();
  });

  $scope.showNav = function($event) {
    $scope.popover.show($event);
  }

  $scope.hideNav = function() {
    $scope.popover.hide();
  }

  DataService.initialize('cars');
}

angular.module('app')
.controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$ionicPopover',
  'AuthService',
  'DataService',
  ApplicationController
]);
