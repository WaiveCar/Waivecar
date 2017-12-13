'use strict';
var angular = require('angular');
require('../services/auth-service.js');

function MenuController ($scope, $auth, $state, $data, $ionicHistory) {
  this.$auth = $auth;
  $scope.$data = $data;


  this.goTo = function(args, opt) {
    if (!opt) {
      opt = {};
    }
    $ionicHistory.nextViewOptions({
      historyRoot: true
    });

    $state.go(args, opt, {
      reload: true,
      inherit: false,
      notify: true,
      location: 'replace'
    });
  };

  this.logout = function logout () {
    $auth.logout();
    $state.go('auth');
  };
}

module.exports =
  angular.module('app.controllers').controller('MenuController', [
    '$scope',
    '$auth',
    '$state',
    '$data',
    '$ionicHistory',
    MenuController
  ]);
