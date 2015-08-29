angular.module('app.controllers').controller('LicenseController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.models = $data.models;
    $scope.active = $data.active;
    $scope.forms = {
      licenseForm: {}
    };

    $scope.createLicense = function() {
      $data.create('licenses', $scope.forms.licenseForm, function(err, data) {
        if (err) console.log(err);
        if (redirectUrl) {
          $state.go('credit-cards-new', $scope.redirection);
        } else {
          $state.go('users-show', { id: $data.active.users.id });
        }
      });
    };

    $scope.removeLicense = function() {
      $data.removeLicense($scope.forms.licenseForm, function(err, data) {
        if (err) console.log(err);
        if (redirectUrl) {
          $state.go($scope.redirection.redirectUrl, $scope.redirection.redirectParams);
        } else {
          $state.go('users-show', { id: $data.active.users.id });
        }
      });
    };

    $scope.init = function() {
      $scope.redirection = {
        redirectUrl    : $state.params.redirectUrl,
        redirectParams : $state.params.redirectParams
      };
    };

    $scope.init();
  }
]);
