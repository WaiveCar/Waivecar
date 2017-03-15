'use strict';
var angular = require('angular');
require('angular-ui-router');
require('ionic');
require('../services/location-service.js');
require('../services/auth-service.js');
require('../services/data-service.js');
require('../services/message-service.js');
require('../services/session-service.js');
require('../services/ride-service.js');

function ApplicationController ($rootScope, $scope, $injector) {

  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $document = $injector.get('$document');
  var $interval = $injector.get('$interval');
  var $ride = $injector.get('$ride');
  var LocationService = $injector.get('LocationService');

  this.models = $data.instances;
  this.active = $data.active;

  function getWindowWidth() {
    return $document.width();
  }

  $document.on('resize', function() {
    this.windowWidth = getWindowWidth();
  }.bind(this));

  this.windowWidth = getWindowWidth();

  $rootScope.$on('authError', function() {
    $auth.logout();
    $state.go('auth-login');
  });

  // $rootScope.$on('socket:error', function (ev, data) {
  //   console.log('TODO: handle socket error:');
  // });

  // Find out what my current app-state and then
  // navigate to the right parts of the app given what
  // the server thinks of me.
  function myState() {
    var currentBooking = false;
    var lastState = false;

    $interval(function() {
      $data.resources.users.me().$promise
        .then(function(me) {

          var shown = $state.current.name;
          console.log($state.current.name, new Date(), me.state);
          if(['ended', 'created', 'started'].indexOf(me.state) !== -1 && !currentBooking) {
            $data.resources.bookings.current().$promise
              .then(function(booking) {
                 currentBooking = booking;
            });
          }
          if(currentBooking) {
            if(me.state === 'created' && shown === 'cars') {
              $ride.setBooking(currentBooking.id);
              $state.go('bookings-active', { id: currentBooking.id });
            } else if(me.state === 'started' && lastState === 'created') {
              $state.go('dashboard', { id: currentBooking.id });
            } else if(me.state === 'completed') {
              // if we have a booking id then we should go to the booking
              // summary screen ONLY if our previous state was 'started', 
              // otherwise this means that we've canceled.
              if(lastState === 'started' && shown !== 'bookings-show') {
                $state.go('bookings-show', { id: currentBooking.id });
              } else if(lastState === 'created' && shown !== 'cars') {
                $state.go('cars');
              }
              currentBooking = false;
            } else if(me.state === 'ended' && shown !== 'end-ride') {
              $state.go('end-ride', { id: currentBooking.id });
            }
          }
          lastState = me.state;
        });
    }, 5000);
  }

  $rootScope.$on('authLogin', function () {
    initLocation();
    $ride.init();
    myState();
  });

  if ($auth.isAuthenticated()) {
    initLocation();
    $auth.loadSession();
    $ride.init();
  }

  function initLocation () {
    LocationService.getCurrentLocation();
    return $data.initialize('locations')
      .catch(function (err) {
        return $message.error(err);
      });
  };
}

module.exports =
  angular.module('app.controllers')
  .controller('ApplicationController', [
    '$rootScope',
    '$scope',
    '$injector',
    ApplicationController
  ]);
