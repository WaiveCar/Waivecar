'use strict';
var angular = require('angular');
var _ = require('lodash');
var hmacsha1 = require('hmacsha1');
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
  var NotificationService = $injector.get('NotificationService');


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
    var currentBooking = false;
    var lastState = false;
    var newState;
    var auth = $session.get('auth');

    // todo: this logic looks like bullshit although it seems to work.
    function checkState(obj, event) {
      var newScreen = obj.to;
      var oldScreen = obj.from;

      // We need to both check the state that the user is currently in
      // along with what they are currently viewing in the app
      if(newState === 'created' && newScreen === 'cars') {
        $ride.init();
        // If the user is in a reservation state (get to your waivecar) and they
        // navigate away and then go to "current ride" it should take them back
        // to the reservation state.
      } else if(newState === 'reserved' && (newScreen === 'bookings-active' || lastState === 'created')) {
        $ride.init();
      } else if(newScreen === 'dashboard' && oldScreen === 'end-ride-location') {
        // prevents the transition from being made
        event.preventDefault();
      } else if((newScreen === 'dashboard' || newScreen === 'cars-show') && $data.active.bookings && $data.active.bookings.status === 'reserved') {
        // on the reservation screen and the user has requested to go to the cars screen
        event.preventDefault();
      } else if(newState === 'completed') {
        // if we have a booking id then we should go to the booking
        // summary screen ONLY if our previous state was 'started',
        // otherwise this means that we've canceled.
        if(((!lastState || lastState === 'started' || lastState === 'ended') && newScreen !== 'bookings-show')|| newScreen === 'end-ride') {
          $state.go('bookings-show', { id: currentBooking.id });
        } else if(lastState === 'created' && newScreen !== 'cars') {
          $state.go('cars');
        }
        currentBooking = false;
      } else if(newState === 'ended' && newScreen !== 'end-ride') {
        $state.go('end-ride', { id: currentBooking.id });
      }
    }

    $data.subscribe('User');

    if(auth) {
      // subscribe to user-specific messages
      $socket.emit('authenticate', auth.token, function(done) {
        console.log('subscribed to messages');
      });

      // This makes sure that the user isn't navigating to a wrong part of the app
      // in the flow of booking a car. Note that the code below will call this code.
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        console.log(fromState.name + ' -> ' + toState.name, newState, $data.active.bookings, currentBooking);
        if($data.me && $data.me.tested && fromState.name && fromState.name !== 'users-edit') {
          checkState({from: fromState.name, to: toState.name}, event);
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

  function setupState() {
    if($data.me.tested) {
      LocationService.getCurrentLocation();
      $data.initialize('locations').catch($message.error);
      // this hopefully loads up a ride screen if necessary
      $ride.init();
      myState();

      NotificationService.setupPushNotifications();
      IntercomService.registerIdentifiedUser($auth.me);
    }
  }

  $rootScope.$on('authLogin', setupState);
  IntercomService.registerForPush();
  // set up the ble pass-thru machinery.
  $data.resources.cars.setup({auth: $auth});

  if ($auth.isAuthenticated()) {
    $auth.loadSession().then(setupState);
  } else {
    IntercomService.registerUnidentifiedUser();
  }

}

module.exports =
  angular.module('app.controllers')
  .controller('ApplicationController', [
    '$rootScope',
    '$scope',
    '$injector',
    ApplicationController
  ]);
