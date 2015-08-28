angular.module('app.controllers').controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {
    $scope.data   = $data.models;
    $scope.active = $data.active;

    $scope.forms = {
      userForm: {}
    };

    $scope.createUser = function() {
      $data.create('users', $scope.forms.userForm, function(err) {
        $auth.login({
          email    : $scope.forms.userForm.email,
          password : $scope.forms.userForm.password
        }, function(auth) {
          $state.go('/');
        });
      });
    };

    $scope.init = function() {
      if ($data.active.users) $state.go('intro');
    };

    $scope.init();
  }
]);
