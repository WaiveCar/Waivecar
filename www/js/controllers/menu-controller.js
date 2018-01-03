'use strict';
var angular = require('angular');
require('../services/auth-service.js');

function MenuController ($scope, $auth, $state, $data, $ionicHistory) {
  this.$auth = $auth;
  $scope.$data = $data;

  this.currentRide = function() {
    var booking = $data.active.bookings;
    var stateMap = {
      reserved: 'bookings-active',
      started: 'dashboard',
      ended: 'end-ride'
    };
    if(stateMap[booking.status]) { 
      return this.goto(stateMap[booking.status], {id: booking.id});
    } 
    console.log('UNHANDLED', booking.status);
  };

  this.goto = function(args, opt) {
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

  this.logout = function() {
    $auth.logout();
    $data.resources.cars.disconnect();
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
