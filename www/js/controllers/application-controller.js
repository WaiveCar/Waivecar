angular.module('app.controllers').controller('ApplicationController', [
  '$rootScope',
  '$scope',
  '$ionicModal',
  '$auth',
  '$account',
  '$data',
  function ($rootScope, $scope, $ionicModal, $auth, $account, $data) {
    'use strict';

    $rootScope.$watch(function() { return $account.me; }, function() {
      if (!(angular.equals($account.me, $rootScope.me))) {
        $rootScope.me = $account.me;
        async.parallel([
          function(completeTask) {
            $data.init('users', completeTask);
          },
          function(completeTask) {
            $data.init('vehicles', completeTask);
          }
        ], function(err) {
          if (err) alert(err);
        });
      }
    }, true);

    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form Data
    $scope.models = {
      signin: {}
    };

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    $scope.logout = $auth.signout;

    // Perform the login action when the user submits the login form
    $scope.signin = function() {
      $auth.login($scope.models.signin).then(function() {
        $account.refresh(function() {
          $scope.closeLogin();
        });
      }).catch(function(err) { console.log(err); });
    };
  }
]);
