'use strict';
var angular = require('angular');
require('angular-ui-router');
require('../services/auth-service');
require('../services/data-service');
require('../services/facebook-service');
require('../services/message-service');
var _ = require('lodash');
var async = require('async');

module.exports = angular.module('app.controllers').controller('UserCreateController', [
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

      return async.series([
        function saveUser(done){
          return $scope.user.$save()
            .then(function(){
              return done();
            })
            .catch(done);

        },

        function login(done){
          return $auth.login({
              identifier: identifier,
              password: pass
            })
            .then(function() {
              done();
            })
            .catch(done);

        },

        function connectWithFacebook(done){
          if(!$stateParams.fbUser){
            return done();
          }
          var fbUser = angular.fromJson($stateParams.fbUser);

          return $auth.connectWithFacebook(fbUser.token)
            .then(function(){
              done();
            })
            .catch(done);

        }

      ], function(err){
        if(err){
          return $message.error(err);
        }

        console.log('auth-account-verify');
        return $state.go('auth-account-verify', {
          step: 2
        });

      });

    };


    $scope.registerWithFacebook = function() {

      async.waterfall([
        function(done){
          return ezfb.getLoginStatus()
            .then(function(getLoginStatusResponse){
              done(null, getLoginStatusResponse);
            }).
            catch(done);

        },

        function(getLoginStatusResponse, done){
          if (getLoginStatusResponse.status === 'connected') {
            return done(null, getLoginStatusResponse);
          }
          return ezfb.login(null, {scope: 'public_profile,email'})
            .then(function(loginResponse){
              done(null, loginResponse);
            }).
            catch(done);

        },

        function(response, done){
          return ezfb.api('/me?fields=email,first_name,last_name')
            .then(function(fbUser){
              console.log('fbUser', fbUser);
              fbUser.token = response.authResponse.accessToken;
              return done(null, fbUser);
            })
            .catch(done);

        }

      ], function(err, fbUser){
        if(err){
          return $message.error(err);
        }

        return $state.go('users-new-facebook', {
          fbUser: angular.toJson(fbUser),
          step: 2
        });

      });

    };

    $scope.init = function() {

      $scope.user = new $data.resources.users();

      if($stateParams.fbUser){
        var fbUser = angular.fromJson($stateParams.fbUser);
        $scope.user.firstName = fbUser.first_name;
        $scope.user.lastName = fbUser.last_name;
        $scope.user.email = fbUser.email;
        $scope.user.token = fbUser.token;

      }

    };

    $scope.init();

  }

]);
