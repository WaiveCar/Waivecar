'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/message-service');
var _ = require('lodash');

module.exports = angular.module('app.controllers').controller('UserEditController', [
  '$rootScope',
  '$scope',
  '$state',
  '$auth',
  '$data',
  '$message',
  function($rootScope, $scope, $state, $auth, $data, $message) {

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

      return $data.resources.users.me().$promise
        .then(function(me) {
          $scope.user = me;
          return $data.resources.licenses.query().$promise;
        }).then(function(licenses) {
          $scope.license = _.chain(licenses).sortBy('createdAt').last().value();
        }).catch($message.error);
    };

    $scope.init();

  }

]);
