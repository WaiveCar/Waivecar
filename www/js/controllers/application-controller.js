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

  $window.bleres = {};
  function testBle(carid) {
    var _token = false;
    var _sessionKey = false;
    var _deviceId = false;

    var CAR_INFORMATION_SERVICE = '869CEFA0-B058-11E4-AB27-00025B03E1F4';
    var _cisMap = {
      COMMAND_CHALLENGE: '869CEFA2-B058-11E4-AB27-00025B03E1F4',
      DRIVING_INFORMATION_1: '869CEFA3-B058-11E4-AB27-00025B03E1F4',
      STATUS_1: '869CEFA5-B058-11E4-AB27-00025B03E1F4',
      GPS_1: '869CEFA8-B058-11E4-AB27-00025B03E1F4',
      CARD_MONITORING: '869CEFAA-B058-11E4-AB27-00025B03E1F4',
      MODEM_STATUS: '869CEFAD-B058-11E4-AB27-00025B03E1F4',
      DEBUG: '869CEFB0-B058-11E4-AB27-00025B03E1F4'
    }; 

    var CAR_CONTROL_SERVICE = '869CEF80-B058-11E4-AB27-00025B03E1F4';
    var AUTHORIZE_PHONE = '869CEF82-B058-11E4-AB27-00025B03E1F4';
    var COMMAND_PHONE = '869CEF84-B058-11E4-AB27-00025B03E1F4';
    var _ccsMap = {
      CENTRAL_LOCK_CLOSE: 0x01,
      CENTRAL_LOCK_OPEN: 0x02,
      IMMOBILIZER_LOCK: 0x04,
      IMMOBILIZER_UNLOCK: 0x08,
      BOARD_RESET: 0x10,
      GSM_RESET: 0x20,
      GPRS_RESET: 0x40,
      BLE_RESET: 0x80,
      TRIGGER_RELAY: 0x100
    };


    function ok(what) {
      return function() {
        console.log('successs ' + what, arguments[0]);
        $window.bleres[what] = arguments[0];
      };
    }
    function failure(what) {
      return function() {
        console.log('failed with ' + what, arguments[0]);
      };
    }

    function b642bin(hex) {
      return new Uint8Array(atob(hex).split('').map(function(c) { 
        return c.charCodeAt(0); 
      }));
    }

    function bin2str(bin) {
      return String.fromCharCode.apply(0, bin);
    }

    function cis(what, success, fail) {
      ble.read(_deviceId, CAR_INFORMATION_SERVICE, _cisMap[what], success, fail);
    }

    function findCarById(id, success, fail) {
      console.log('scanning');
      ble.startScan([], function(car) { 
        console.log(car.name, car.id, id);
        if (car.name === id) {
          console.log('found car');
          _deviceId = car.id;
          ble.connect(car.id, function() {
            console.log('connected');
            success(car.id);
          }, fail);
        }
      }, fail);
    }

    function partitionData(raw) {
      var payloadList = [], 
        unit = 18,
        row,
        offset,
        ttl = raw.length;
        
      for(var start = 0; start < raw.length; start += unit) {
        row = new Uint8Array(2 + Math.min(unit, raw.length - start));
        row[0] = ttl;
        ttl -= unit;
        offset = 2;
        for(var ix = start; ix < Math.min(start + unit, raw.length); ix++) {
          row[offset] = raw[ix];
          offset++; 
        }
        payloadList.push(row);
      }
      return payloadList;
    }

    function writeBig(service, characteristic, rawPayload, success, fail) {
      var payload = partitionData(rawPayload);

      function sendData(arg) {
        if(payload.length === 0) {
          return success(arg);
        } 
        ble.write(_deviceId, service, characteristic, payload.shift().buffer, sendData, fail);
      }
      
      sendData();
    }

    function doit(what) {
      var command = new Uint8Array(10);
      command[0] = _ccsMap[what];
      cis('COMMAND_CHALLENGE', function(commandChallenge) {
        var valueCommandArray = _.toArray(command).concat(_.toArray(commandChallenge));
        var responseb64 = hmacsha1(bin2str(valueCommandArray), bin2str(_sessionKey));
        var payload = _.toArray(command).concat(b642bin(responseb64));
        ble.write(_deviceId, CAR_CONTROL_SERVICE, COMMAND_PHONE, new Uint8Array(payload), ok(what), failure(what));
      });
    }

    function authorizeCar(mac) {
      writeBig(mac, CAR_CONTROL_SERVICE, AUTHORIZE_PHONE, _token, ok('authorized'), failure('authorized'));
    }

    $data.resources.car.ble({ id: carid }).$promise.then(function (creds) {
      _token = b642bin(creds.token);
      _sessionKey = b642bin(creds.sessionKey);
      findCarById(carId, authorizeCar, failure('findcar'));
    });

    $window.doit = doit;
    $window.bleread = function(what) {
      cis(what, function(a) {
        $window.bleres[what] = a;
        console.log('read ' + what);
      }, failure('read ' + what));
    };
  }

  $window.testBle = testBle;

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
      } else if(newState === 'started' && (newScreen === 'bookings-active' || lastState === 'created')) {
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

  IntercomService.setLauncherVisibility();

  $rootScope.$on('authLogin', function () {
    if($data.me.tested) {
      initLocation();
      $ride.init();
      myState();
      IntercomService.registerIdentifiedUser($auth.me);
    }
  });

  IntercomService.registerForPush();

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
