'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/facebook-service');
require('../services/message-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('UserEditController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  'FaceBookService',
  '$message',
  'ezfb',
  '$stateParams',
  function($rootScope, $scope, $state, $auth, $data, FaceBookService, $message, ezfb, $stateParams) {

    $scope.save = function(form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      var identifier = $scope.user.email;
      var pass = $scope.user.password;
      $scope.user.$save()
        .then(function() {
          if ($auth.isAuthenticated()) {
            return $message.success('Saved!');
          }

          return $auth.login({
              identifier: identifier,
              password: pass
            })
            .then(function() {
              return $state.go('licenses-photo-new', {
                step: 3
              });
            });

        })
        .catch($message.error);

    };


    $scope.registerWithFacebook = function() {
      return ezfb.getLoginStatus()
        .then(function(response){
          if (response.status !== 'connected') {
            return ezfb.login();
          }
          return response;

        })
        .then(function(res) {
          if (res.status === 'connected') {
            // return $auth.registerWithFacebook(res.authResponse);
            return $state.go('users-new-facebook', {
              authResponse: res.authResponse
            });
          }
        })
        // .then(function() {
        //   return $state.go('licenses-photo-new', {
        //     step: 3
        //   });

        // })
        .catch($message.error);

    };

    $scope.init = function() {

      if (!$state.params.id) {
        $scope.user = new $data.resources.users();

        if($stateParams.authResponse){
          $scope.user.firstName = $stateParams.authResponse.firstName;
          $scope.user.lastName = $stateParams.authResponse.lastName;
          $scope.user.email = $stateParams.authResponse.email;
        }

        return false;
      }

      return $data.resources.users.get({
          id: $state.params.id
        }).$promise
        .then(function(user) {
          $scope.user = user;
          return $data.resources.licenses.query().$promise;

        })
        .then(function(licenses) {
          $scope.latestLicense = _.chain(licenses).sortBy('createdAt').last().value();

        })
        .catch($message.error);

    };

    $scope.init();

  }

]);
