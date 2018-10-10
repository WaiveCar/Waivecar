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
  '$q',
  '$injector',
  function($rootScope, $scope, $state, $auth, $data, $message, $q, $injector) {

    $scope.save = function(form) {
      if (form.$invalid) {
        return $message.error('Please fix form errors and try again.');
      }

      $scope.user.$save()
        .then(function() {
          $scope.init(function() {
            if ($auth.bypass) {
              // this is to avoid making redundantly stupid requests
              // when going back to the verify screen.
              $auth.me.phone = $scope.user.phone;
              $state.go('auth-account-verify', { step: 2 });
            } else {
              return $message.success('Your details have been successfully updated');
            }
          });
        })
        .catch($message.error);
    };


    $scope.init = function(next) {
      // This is mostly stolen from http://stackoverflow.com/a/21056378/535759
      var promiseMap = {};
      $scope.loaded = false;

      if(!$scope.user) {
        promiseMap.user = $data.resources.users.me().$promise;
      }
      if(!('card' in $scope)) {
        promiseMap.card = $data.resources.Card.query().$promise;
      }
      if(!('license' in $scope) || $scope.license.outcome === 'consider') {
        promiseMap.license = $data.resources.licenses.query().$promise;
      }

      return $q.all(promiseMap).then(function(res) {
        var stepsDone = false;

        $scope.user = $scope.user || res.user;
        $scope.card = $scope.card || (res.card ? res.card[0] : false);
        $scope.license = $scope.license || _(res.license)
            .sortBy('createdAt')
            .last() || {};

        $scope.license.current = $scope.license.outcome;

        // With regard to the current flow we require the user to tap again
        // to actually "validate" the id
        if( 
            // needs validation ... this means that the person hasn't done all the
            // steps yet (since we run the validation after everything is done). 
            // We communicate this as leaving it in pending.
            ( $scope.license.status === 'provided' && !$scope.license.outcome ) 
            || $scope.license.status === 'in-progress' 
            || $scope.license.status === 'provided' 
            || $scope.license.outcome === 'consider'
          ) {
          $scope.license.current = 'pending';
        }

        // Has the user given us a selfie and license photo?
        //
        // We are shortcutting this as we abandon this app (2018-10-02)
        //
        $scope.user.verified = true; // ($scope.user.avatar && $scope.license.fileId);

        // Have they at least filled in all the fields
        stepsDone = (
             $scope.user.tested 
          && $scope.user.verified
          && $scope.user.verifiedPhone 
          && $scope.card
          && $scope.license
        );

        // If the user has filled everything out and is waiting on us.
        $scope.isPending = ($scope.license.current === 'pending' || $scope.user.status === 'pending');

        // If they've completed everything but they are either suspended or in pending or their license
        // is rejected. TODO: pending should become probation eventually
        $scope.hasFailed = ($scope.user.status === 'pending' || $scope.user.status === 'suspended' || $scope.license.current === 'reject');
        $scope.canBook = (stepsDone && ($scope.user.status === 'active' || $scope.user.status === 'probation') && $scope.license.current === 'clear');

        // If the user has finished all the steps and we haven't run the license validation, we
        // do that now.
        if (stepsDone && !$scope.license.outcome && $scope.license.status === 'provided') {
          var $validateLicense = $injector.get('$validateLicense');
          $scope.spinner = true;
          $validateLicense.validate($scope.license).then(function() {
            delete $scope.license;
            $scope.spinner = false;
            $scope.init();
          });
        }

        // I want to avoid the flashing default state so I toggle this 
        $scope.loaded = true;

        if (next) {
          return next();
        }
      }).catch($message.error);
    };

    $scope.init();

    $scope.goToResetPassword = function() {
      $state.go('auth-forgot-password');
    }

  }
]);
