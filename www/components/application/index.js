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

  $rootScope.$on('socket:error', function (ev, data) {
    console.log('TODO: handle socket error:');
    console.log(ev);
    console.log(data);
  });

  $scope.showNav = function($event) {
    $scope.popover.show($event);
  }

  $scope.hideNav = function() {
    $scope.popover.hide();
  }

  DataService.initialize('cars');
}
function dialogDirective(){
  return {
    restrict:'E',
    scope:{
      title:'@',
      subtitle:'@',
      buttonText:'@',
      setDisplayFunction: '&',
      setHideFunction: '&',
      onButtonClick:'&'
    },
    link: function(scope, element, attrs){
      // alert("ON LINK");
      scope.setDisplayFunction({'fn':function(){
            // alert("On set dísplay");
            // alert(element[0].firstChild);
            //             alert(element[0].firstChild.style);

        element[0].firstChild.style.display="block";
        // alert("Done");

      }});
      scope.setHideFunction({'fn':function(){
        element[0].firstChild.style.display="none";
      }});
    },
    templateUrl:'/components/application/templates/overlay-dialog.html'
  }
}

angular.module('app')
.directive('overlayDialog',dialogDirective)
.controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$ionicPopover',
  'AuthService',
  'DataService',
  ApplicationController
]);
