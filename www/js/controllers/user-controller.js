angular.module('app.controllers').controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  function ($rootScope, $scope, $state, $auth, $data) {

    $scope.forms = {
      userForm: {}
    };

    $scope.createUser = function() {
      $data.create('users', $scope.forms.userForm, function(err) {
        $auth.login({
          email    : $scope.forms.userForm.email,
          password : $scope.forms.userForm.password
        }, function(auth) {
          $state.go('landing');
        });
      });
    };

    $scope.init = function() {
      if ($auth.isAuthenticated()) $state.go('landing');
    };

    $scope.init();
  }
]);
