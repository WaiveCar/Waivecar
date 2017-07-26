'use strict';
var angular = require('angular');
var _ = require('lodash');
require('angular-ui-router');
require('ionic');
require('../services/location-service.js');
require('../services/auth-service.js');
require('../services/data-service.js');
require('../services/message-service.js');
require('../services/session-service.js');
require('../services/ride-service.js');
require('../services/intercom-service.js');

function ApplicationController ($rootScope, $scope, $injector) {
  var $state = $injector.get('$state');
  var $auth = $injector.get('$auth');
  var $data = $injector.get('$data');
  var $message = $injector.get('$message');
  var $document = $injector.get('$document');
  var $interval = $injector.get('$interval');
  var $ride = $injector.get('$ride');
  var $socket = $injector.get('$socket');
  var $session = $injector.get('$session');
  var $window = $injector.get('$window');
  var LocationService = $injector.get('LocationService');
  var IntercomService = $injector.get('IntercomService');

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
    $state.go('auth');
  });

  // $rootScope.$on('socket:error', function (ev, data) {
  //   console.log('TODO: handle socket error:');
  // });

  // Find out what my current app-state and then
  // navigate to the right parts of the app given what
  // the server thinks of me.
  function myState() {
    console.log('In my state');
    var currentBooking = false;
    var lastState = false;
    var newState;
    var auth = $session.get('auth');

    // todo: this logic looks like bullshit although it seems to work.
    function checkState(shown) {
      // We need to both check the state that the user is currently in
      // along with what they are currently viewing in the app
      if(newState === 'created' && shown === 'cars') {
        $ride.init();
      } else if(newState === 'started' && (shown === 'bookings-active' || lastState === 'created')) {
        $ride.init();
      } else if(newState === 'completed') {
        // if we have a booking id then we should go to the booking
        // summary screen ONLY if our previous state was 'started',
        // otherwise this means that we've canceled.
        if(((!lastState || lastState === 'started' || lastState === 'ended') && shown !== 'bookings-show')|| shown === 'end-ride') {
          $state.go('bookings-show', { id: currentBooking.id });
        } else if(lastState === 'created' && shown !== 'cars') {
          $state.go('cars');
        }
        currentBooking = false;
      } else if(newState === 'ended' && shown !== 'end-ride') {
        $state.go('end-ride', { id: currentBooking.id });
      }
    }

    $data.subscribe('User');

    console.log('in the function');
    if(auth) {
      // subscribe to user-specific messages
      console.log('in the auth function');
      $socket.emit('authenticate', auth.token, function(done) {
        console.log('subscribed to messages');
      });

      // This makes sure that the user isn't navigating to a wrong part of the app
      // in the flow of booking a car. Note that the code below will call this code.
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        console.log(fromState.name + ' -> ' + toState.name, newState, currentBooking);
        if($data.me && $data.me.tested && fromState.name && ['users-edit'].indexOf(fromState.name) === -1) {
          checkState(toState.name);
        }
      });

      // This will move the app to a new state if an admin puts the user inside a car
      $scope.$watch('app.models.User', function(user) {
        if(user) {
          newState = user[0].state;

          if(['ended', 'created', 'started', 'completed'].indexOf(newState) !== -1 && !currentBooking) {
            currentBooking = _($scope.app.models.bookings)
              .filter({userId: $auth.me.id})
              .find(function (b) {
                return [ 'cancelled', 'completed', 'closed' ].indexOf(b.status) === -1;
              });
          }

          // this should not be any else logic because we could be
          // assigning the current booking from the above code for this
          if(currentBooking) {
            checkState($state.current.name);
          }

          lastState = newState;
        }
      }, true);
    }
  }

  IntercomService.setLauncherVisibility();

  $rootScope.$on('authLogin', function () {
    if($data.me.tested) {
      initLocation();
      $ride.init();
      myState();
      IntercomService.registerIdentifiedUser($auth.me);
    }
  });

  if ($auth.isAuthenticated()) {
    initLocation();
    $auth.loadSession().then(function(me) {
      IntercomService.registerIdentifiedUser(me);
    });
    $ride.init();
    myState();
  } else {
    IntercomService.registerUnidentifiedUser();
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
