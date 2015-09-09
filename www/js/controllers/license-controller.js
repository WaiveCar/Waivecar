angular.module('app.controllers').controller('LicenseController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.forms = {
      licenseForm: {}
    };

    $scope.createLicense = function() {
      $data.create('licenses', $scope.forms.licenseForm, function(err, data) {
        if (err) {
          console.log(err);
          return;
        }

        if ($scope.redirection.redirectState) {
          $state.go('credit-cards-new', $scope.redirection);
        } else {
          $state.go('users-show', { id: $data.me.id });
        }
      });
    };

    $scope.removeLicense = function() {
      $data.removeLicense($scope.forms.licenseForm, function(err, data) {
        if (err) {
          console.log(err);
          return;
        }

        if ($scope.redirection.redirectState) {
          $state.go($scope.redirection.redirectState, $scope.redirection.redirectParams);
        } else {
          $state.go('users-show', { id: $data.me.id });
        }
      });
    };

    $scope.init = function() {
      $scope.redirection = {
        redirectState  : $state.params.redirectState,
        redirectParams : $state.params.redirectParams
      };
    };

    $scope.init();
  }
]);
