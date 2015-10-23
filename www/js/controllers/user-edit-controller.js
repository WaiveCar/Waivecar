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
  function($rootScope, $scope, $state, $auth, $data, FaceBookService, $message) {

    $scope.save = function(form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      $scope.user.$save()
        .then(function() {
          return $message.success('Saved!');
        })
        .catch($message.error);

    };


    $scope.init = function() {

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
