'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/facebook-service');
require('../services/message-service');

module.exports = angular.module('app.controllers').controller('UserController', [
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

    $scope.createUser = function (form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      $data.create('users', $scope.forms.userForm)
        .then(function () {
          return $auth.login({
            email: $scope.forms.userForm.email,
            password: $scope.forms.userForm.password
          });

        })
        .then(function () {
          return $state.go('licenses-photo', {
            step: 3
          });
        })
        .catch($message.error);

    };

    // function registerUserByFacebook(code) {
    //   var data = {
    //     type: 'register',
    //     code: code,
    //     redirectUri: 'http://localhost/'
    //   };

    //   $data.resources.users.facebook(data, function (result) {
    //       $data.merge('users', result);
    //       $data.activateKnownModel('users', result.id, function () {
    //         $state.go('landing');
    //       });
    //     },
    //     $message.error);

    // }

    $scope.connectWithFacebook = function () {

      throw new Error('UserController.connectWithFacebook not implemented!');

      // FaceBookService.getFacebookInfo()
      //   .then(registerUserByFacebook)
      //   .catch($message.error);

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
