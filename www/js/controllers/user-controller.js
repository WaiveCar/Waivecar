'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/facebook-service');
require('../services/message-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('UserController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'FaceBookService',
  '$message',
  function ($rootScope, $scope, $state, $auth, $data, FaceBookService, $message) {

    $scope.save = function (form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      var identifier = $scope.user.email;
      var pass = $scope.user.password;
      $scope.user.$save()
        .then(function () {
          if ($auth.isAuthenticated()) {
            return $message.success('Saved!');
          }

          return $auth.login({
              identifier: identifier,
              password: pass
            })
            .then(function () {
              return $state.go('licenses-photo-new', {
                step: 3
              });
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

      if (!$state.params.id) {
        $scope.user = new $data.resources.users();
        return false;
      }

      return $data.resources.users.get({
          id: $state.params.id
        }).$promise
        .then(function (user) {
          $scope.user = user;
          return $data.resources.licenses.query().$promise;

        })
        .then(function (licenses) {
          $scope.latestLicense = _.chain(licenses).sortBy('createdAt').last().value();

        })
        .catch($message.error);

    };

    $scope.init();

  }

]);
