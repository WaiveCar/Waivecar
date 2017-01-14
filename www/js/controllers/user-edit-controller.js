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
          $scope.init(function() {
            return $message.success('Your details have been successfully updated');
          });
        })
        .catch($message.error);
    };


    $scope.init = function(next) {
      
      return $data.resources.users.me().$promise
        .then(function(me) {
          $scope.user = me;
          return $data.resources.Card.query().$promise;
        }).then(function(card) {
          $scope.card = card ? card[0] : false;
        }).then(function() {
          return $data.resources.licenses.query().$promise;
        }).then(function(licenses) {
          var stepsDone = false;

          $scope.license = _(licenses)
            .filter({userId: $scope.user.id})
            .sortBy('createdAt')
            .last() || {};

          // With regard to the current flow we require the user to tap again
          // to actually "validate" the id
          if( $scope.license.status === 'provided' && !$scope.license.outcome ) {
            $scope.license.outcome = 'needsValidation';
          } else if(    
                 $scope.license.status === 'in-progress' 
              || $scope.license.status === 'provided' 
              || $scope.license.outcome === 'consider'
            ) {
            $scope.license.outcome = 'pending';
          }

          // Has the user given us a selfie and license photo?
          $scope.user.verified = ($scope.user.avatar && $scope.license.fileId);

          // Have they at least filled in all the fields
          stepsDone = (
               $scope.user.tested 
            && $scope.user.verified
            && $scope.user.verifiedPhone 
            && $scope.card
            && $scope.license
          );

          // If the user has filled everything out and is waiting on us.
          $scope.isPending = ($scope.license.outcome === 'pending' || (stepsDone && $scope.user.status === 'pending'));
          $scope.hasFailed = ($scope.user.status === 'suspended' || $scope.license.outcome === 'reject');
          $scope.canBook = (stepsDone && $scope.user.status === 'active' && $scope.license.outcome === 'clear');

          if (next) {
            return next();
          }
        }).catch($message.error);
    };

    $scope.init();

  }

]);
