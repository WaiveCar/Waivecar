'use strict';
var angular = require('angular');
require('../services/auth-service.js');

function MenuController ($scope, $auth, $state, $data) {
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
      $state.go(stateMap[booking.status], {id: booking.id});
    } else {
      console.log('UNHANDLED', booking.status);
    }
  }

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
    MenuController
  ]);
