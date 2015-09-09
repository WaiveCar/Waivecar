angular.module('app.controllers').controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'FaceBookService',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, FaceBookService, $message) {

    $scope.forms = {
      userForm: {}
    };

    $scope.createUser = function () {
      $data.create('users', $scope.forms.userForm, function (err) {
        $auth.login({
          email: $scope.forms.userForm.email,
          password: $scope.forms.userForm.password
        }, function (auth) {
          $state.go('landing');
        });
      });
    };

    function registerUserByFacebook(code) {
      var data = {
        type: 'register',
        code: code,
        redirectUri: 'http://localhost/'
      };

      $data.resources.users.facebook(data, function (result) {
          $data.merge('users', result);
          $data.activateKnownModel('users', result.id, function (err, data) {
            $state.go('landing');
          });
        },
        $message.error);

    };

    $scope.connectWithFacebook = function () {

      FaceBookService.getFacebookInfo()
        .then(registerUserByFacebook)
        .catch($message.error);

    };

    $scope.init = function () {
      if ($auth.isAuthenticated()) {
        $state.go('landing');
      }

      if ($state.params.id) {
        $data.activate('users', $state.params.id);
      }

    };

    $scope.init();

  }

]);
