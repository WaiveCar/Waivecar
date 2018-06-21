'use strict';
var angular = require('angular');
var ionic = require('ionic');
var hmacsha1 = require('hmacsha1');
var _ = require('lodash');

module.exports = angular.module('app.services').factory('$ble', [
  '$window',
  '$interval',
  '$q',
  function ($window, $interval, $q) {
    var CAR_INFORMATION_SERVICE = '869CEFA0-B058-11E4-AB27-00025B03E1F4';
    var _cisMap = {
      COMMAND_CHALLENGE: {
        code: '869CEFA2-B058-11E4-AB27-00025B03E1F4',
      },
      DRIVING_INFORMATION_1: {
        code: '869CEFA3-B058-11E4-AB27-00025B03E1F4',
        format: [
          [ 2, 'fuel' ],
          [ 4, 'speed' ],
          [ 4, 'mileage' ]
        ]
      },
      STATUS_1: {
        code: '869CEFA5-B058-11E4-AB27-00025B03E1F4',
        format: [
          [ 1, 'ignition' ],
          [ 1, 'lock' ],
          [ 1, 'immobilizer' ],
          [ 1, 'doors' ],
          [ 1, 'windows' ],
          [ 1, 'lights' ],
          [ 1, 'break' ],
          [ 1, 'lockcan' ],
          [ 2, 'voltage' ],
          [ 1, 'charge' ],
          [ 1, 'quickcharge' ],
          [ 1, 'adapter' ],
          [ 2, 'range' ]
        ]
      },
      GPS_1: {
        code: '869CEFA8-B058-11E4-AB27-00025B03E1F4',
        format: [
          [ '4float', 'latitude' ],
          [ '4float', 'longitude' ],
          [ 4, 'time' ],
          [ 2, 'speed' ],
          [ 2, 'hdop' ],
          [ 1, 'quality' ],
          [ 1, 'satellites' ]
        ]
      },
      CARD_MONITORING: {
        code: '869CEFAA-B058-11E4-AB27-00025B03E1F4',
      },
      MODEM_STATUS: {
        code: '869CEFAD-B058-11E4-AB27-00025B03E1F4',
      },
      DEBUG: {
        code: '869CEFB0-B058-11E4-AB27-00025B03E1F4',
      },
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

    _ccsMap.start = _ccsMap.CENTRAL_LOCK_OPEN | _ccsMap.IMMOBILIZER_UNLOCK;
    _ccsMap.finish = _ccsMap.CENTRAL_LOCK_CLOSE | _ccsMap.IMMOBILIZER_LOCK;

    var _sessionKey = false;
    var _deviceId = false;
    var _injected = {};
    var _creds = {};
    var _scanCache = {};
    var _lastStatus = false;
    var _res = {};
    var _desiredCar = false;
    var _lock = {
      token: false,
      nextLock: new Date()
    };
    var UNKNOWN = 0;
    var LOCKED = 1;
    var UNLOCKED = 2;
    var ON = 2;
    var OFF = 1;

    // If the token is set to expire then we need to grab another. We assume
    //
    //  clock drift + network time + estimated 90% network failure time (signal) + unknown unknowns
    //
    // 60s + 15s + 90s + 120s = 4.75 minutes ...
    //
    //  that means that if a token is expiring in 4.75 minutes we try to go
    //  out and get another one
    //
    var MINTIME = 285 * 1000;
    var mlog = {};

    $window.blefn = {
      whoami: function() {
        getBle().then(function() {
          var _lowest = {rssi: -1000};
          var _lastCar = false;
          $window.setInterval(function() {
            ble.startScan([], function(car) {
              if(car.rssi > _lowest.rssi) {
                _lowest.name = car.name;
                _lowest.rssi = car.rssi;
              }
            });
            if(_lastCar !== _lowest.name) {
              console.log(_lowest.name, _lowest.rssi);
              _lastCar = _lowest.name;
            }
            _lowest.rssi -= 0.25;
          }, 400);
        });
      },
      scan: function() {
        getBle().then(function() {
          ble.startScan([], function(car) {
            console.log(car);
          });
        });
      },
      doit: function(what) {
        doit(what, ok(what), failure(what)); 
      },
      read: function(what) {
        Object.keys(_cisMap).forEach(function(key) {
          cis(key, function(res) {
            console.log(res, key);
          });
        });
      }
    };

    var _start = 0;
    function log(what) {
      console.log(log.time() + Array.prototype.slice.call(arguments).join(' '));
    }
    log.reset = function() {
      _start = +new Date();
    };
    log.time = function(){
      if(!_start) {
        log.reset();
      }
      return ((+new Date() - _start) / 1000).toFixed(3) + ": ";
    };

    // there's some cyclic dependency bullshit that
    // shouldn't be happening because of lazy loading
    // but fuck angular so it's here. To avoid this
    // bullshit we pass things down since having mutual
    // co-dependency is outside the comprehension of
    // classical oop programmers. boohoo, fuck these
    // people.
    function setFunction(name, cb) {
      if(!(name in _injected)) {
        _injected[name] = cb;
      }
    }

    var _mutex = {};
    function getLock(what, defer) {
      if(_mutex[what] && new Date() - _mutex[what] < 60 * 1000) {
        defer.reject("Mutex locked " + _mutex[what]);
        return false;
      } else {
        log("Acquiring mutex", what);
        _mutex[what] = new Date();
        defer.promise.then(function() {
          log("Releasing mutex", what);
          delete _mutex[what];
        }).catch(function() {
          log("Releasing mutex", what);
          delete _mutex[what];
        });
        return true;
      }
    }

    // a wrapper around the ble functions so we know that things are enabled or not.
    function getBle() {
      var defer = $q.defer();
      var fn;

      if(ionic.Platform.isIOS()) {
        fn = ble.isEnabled;
      } else {
        fn = ble.enable;
      }

      if(getLock('bleScan', defer)) {
        fn(
          ok("BLE on", defer.resolve),
          failure('ble not enabled', defer.reject)
        );
      }

      return defer.promise;
    }

    // pass through functions for debugging success and failure
    function ok(what, okFn) {
      return function() {
        console.log(log.time() + 'Successs ' + what, arguments[0]);
        if(okFn) {
          return okFn(what, arguments[0]);
        }
      };
    }

    function failure(what, failFn) {
      return function() {
        console.log(log.time() + 'Failed with (' + what + ')', arguments[0]);
        if(failFn) {
          return failFn(what, arguments[0]);
        }
      };
    }

    function b642array(b64) {
      return atob(b64).split('').map(function(c) {
        return c.charCodeAt(0);
      });
    }

    function b642bin(b64) {
      return new Uint8Array(b642array(b64));
    }

    function bin2str(bin) {
      return String.fromCharCode.apply(0, bin);
    }

    function buf2hex(buffer) { // buffer is an ArrayBuffer
      return Array.prototype.map.call(new Uint8Array(buffer), function(x){ return ('00' + x.toString(16)).slice(-2); } ).join('');
    }

    // This decodes binary data and puts it into our poor-man's C struct format for
    // the various things we can read.
    function cisDecode(buf, fmt, cb) {
      if(!fmt) {
        return cb(buf);
      }
      var struct = {};
      var pointer = 0;
      fmt.forEach(function(format) {
        var type = format[0];
        var name = format[1];
        var value = false;

        switch(type) {
          case 1:
            value = (new Uint8Array(buf, pointer, 1))[0];
            pointer += 1;
            break;
          case 2:
            // This stupid slice trick is needed because the buffer* prototype wants
            // structural alignment which is retarded.
            value = new Uint16Array(buf.slice(pointer, pointer + 2), 0, 1);
            pointer += 2;
            break;
          case 4:
            // The 4 versus 4float is a very primitive type system
            value = new Uint32Array(buf.slice(pointer, pointer + 4), 0, 1);
            pointer += 4;
            break;
          case '4float':
            value = new Float32Array(buf.slice(pointer, pointer + 4), 0, 1);
            pointer += 4;
            break;
        }

        struct[name] = value;
      });

      return cb(struct);
    }

    function cis(what, success, fail) {
      ble.read(_deviceId, CAR_INFORMATION_SERVICE, _cisMap[what].code, function(buf) {
        cisDecode(buf, _cisMap[what].format, success);
      }, fail);
    }

    function lowLevelConnect(car, success, fail) {
      log('Found car ' + car.id);
      ble.connect(car.id, function() {
        _deviceId = car.id;
        log("Connected to", _deviceId);
        success();
      }, failure('ble.connect ' + car.id, fail));
    }

    var ctr = 0;
    // There's a "cache" to speed things up. If
    // we try to reconnect, then we look for the
    // mapping between the car and the mac address
    // If we can find it then we just try to connect.
    function findCarById(id, success, fail) {
      var _car = _scanCache[id];
      var ix = ctr++;
      if(_car) {
        return lowLevelConnect(_car, success, fail);
      }
      getBle().then(function() {
        // this devilish function returns many times,
        // via a "progress" feature of promises. It
        // never gets to "complete"
        ble.startScan([], function(car) {
          _scanCache[car.id] = car;
          if (car.name === id) {
            console.log("success connect " + ix);
            lowLevelConnect(car, success, fail);
          }
        }, failure('scan', fail));

        setTimeout(function() {
          log("Stopping the scan " + ix + " (" + _deviceId + ")");
          ble.stopScan();
          if(!_deviceId) {
            failure("Couldn't find Car", fail)();
          }
        }, 12 * 1000);

      }).catch(failure('no ble', fail));
    }

    // invers has a "protocol" for sending large payloads. This is
    // essentially re-interpreted Java code from the documentation.
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

    // All the write actions, such as lock and unlock, follow some challenge response
    // protocol invented by invers to prevent replay attacks.
    function doit(what, success, fail) {
      var command = new Array(10).fill(0);
      if(!(what in _ccsMap)) {
        fail("Unable to find code for command " + what);
      }
      command[0] = _ccsMap[what];
      cis('COMMAND_CHALLENGE', function(commandChallenge) {

        commandChallenge = new Uint8Array(commandChallenge);
        var valueCommandArray = command.concat(_.toArray(commandChallenge));

        // The order of these arguments is inconsistent with invers's documentation.
        // This is correct, the documentation is wrong.
        var responseb64 = hmacsha1(bin2str(_sessionKey), bin2str(valueCommandArray));
        var payload = command.concat(b642array(responseb64)).slice(0, 20);
        var toWrite = (new Uint8Array(payload)).buffer;
        ble.write(_deviceId, CAR_CONTROL_SERVICE, COMMAND_PHONE, toWrite, success, failure(what, fail));
      }, function(errStr) {
        log("Trying to see if I can fix this");
        if(errStr.indexOf('is not connected') !== -1) {
          log("Trying to connect to the car ", _desiredCar);
          connect(_desiredCar, true);
        }
        return fail(errStr);
      });
    }

    function getCredentials(carId) {
      var defer = $q.defer();

      function setup(creds) {
        console.log(creds);
        _creds = creds;
        _creds.carId = carId || creds.carId;
        _creds.disconnected = false;
        _creds.authorized = false;
        _creds.expire = new Date(creds.valid_until);
        if(creds.sessionKey) {
          _sessionKey = b642bin(creds.sessionKey);
          $window.localStorage['creds'] = JSON.stringify(_creds);
          defer.resolve(_creds);
        } else {
          defer.reject("No car");
        }
        return creds;
      }

      _injected.getBle({ id: carId }).$promise
        .then(setup)
        .catch(function(m) {
          console.log(m);
          if('creds' in $window.localStorage) {
            var creds = JSON.parse($window.localStorage['creds']);
            // we need to make sure that if we have no network and
            // the app has crashed that the logic still tries to
            // give it a good effort to unlock a car.
            if(creds.carId === carId || !carId) {
              log("Using credentials stored in local storage for " + creds.carId);
              return setup(creds);
            }
          }
          defer.reject("No network + no localStorage");
        });

      return defer.promise;
    }

    function authorize(carId, defer) {
      log("Looking for car", carId);
      findCarById(carId, function() {
        log("Authorizing", carId);
        var token = b642bin(_creds.token);
        writeBig(CAR_CONTROL_SERVICE, AUTHORIZE_PHONE, token, function(pass) {
          _creds.authorized = true;
          log("Authorized", carId);
          return defer.resolve(pass);
        }, failure('write', defer.reject));
      }, failure('find car', defer.reject));
    }

    function connect(carId, doForce) {
      var defer = $q.defer();

      // We state that this is the car that we intend to contact
      _desiredCar = carId;

      // we can get here before we have creds at all, in which case we claim that
      // we are expired.
      var expired = _creds.expire ? _creds.expire - new Date() < MINTIME : true;

      // If we are trying to connect to the same car, we haven't disconnected, and the
      // credentials haven't expired, then we can just completely skip this step.
      if(!doForce && _creds.carId === carId && !_creds.disconnected && !expired && _deviceId && _creds.authorized) {
        log("No new connection needed", _deviceId);
        defer.resolve();
      } else {
        if (!getLock('connect', defer)) {
          return defer;
        }
        //
        // This is an example of what is returned by ble:
        //
        // {
        // "uuid":"7a64d13a-0d7b-4817-b762-41f7bbcae274",
        // "token":"65a***",
        // "sessionKey":"sX***",
        // "valid_from":"2017-11-09T01:32:06.648Z",
        // "valid_until":"2017-11-09T02:32:06.648Z"
        // }
        //
        if(!expired && _creds.carId === carId ) {
          log("Using existing token", carId);
          authorize(carId, defer);
        } else if(carId){
          log("Getting tokens", carId);
          getCredentials(carId).then(function(creds) {
            // creds.carId is an important distinction because
            // we can pull out the rug from underneath our notion
            // of what car to look for if we aren't connected to
            // the internet. This is because we tentatively do not
            // know ... we have to use our cached copy in localStorage.
            //
            // Under normal circumstances this will just *be* carId
            // and we're good.
            return authorize(creds.carId, defer);
          }).catch(defer.reject);
        }
      }
      return defer;
    }

    function disconnectAndForget() {
      disconnect();
      _desiredCar = false;
      _creds = {};
      _sessionKey = false;
      delete $window.localStorage['creds'];
    }

    function disconnect() {
      log("Disconnecting from " + _deviceId);
      // This magical flag is trusted as an authority.
      // It probably shouldn't be ... but it is.
      if(_deviceId) {
        ble.disconnect(_deviceId);
      }
      _creds.disconnected = true;
      _creds.authorized = false;
      _deviceId = false;
    }

    function wrap(carId, cmd, done) {

      log.reset();
      var defer = $q.defer();
      defer.reject();
      defer.$promise = defer.promise;

      return defer;

      // log.reset();
      // var defer = $q.defer();
      //
      // // We need to make sure that if we have no network and
      // // the app has crashed that we can try to do some good
      // // guess work to find out what the car is that we need
      // // to talk to. At worse this will simply be undefined
      // // while at best it will be the car we need.
      // if(!carId) {
      //   carId = _creds.carId;
      // }
      //
      // connect(carId).promise.then(function(){
      //   log("Doing " + cmd);
      //
      //   if(!done) {
      //     return doit(cmd, ok("Done " + cmd, defer.resolve), failure("Not done " + cmd, defer.reject));
      //   } else {
      //     return defer.resolve("Skipping " + cmd + " - already done");
      //   }
      // }).catch(failure("connect", defer.reject));
      //
      // defer.$promise = defer.promise;
      // return defer;
    }

    function isLocked(obj) {
      obj = obj || _lastStatus;
      if(obj) {
        return obj.lock === LOCKED;
      }
    }

    function getStatus(carId) {
      var defer = $q.defer();
      if(_creds.carId === carId && _lastStatus) {
        defer.resolve({
          isIgnitionOn: _lastStatus.ignition === ON,
          isLocked: isLocked()
        });
      } else {
        defer.reject();
      }
      return defer.promise;
    }

    function poll() {
      /*
      var average = 0;
      var signalHistory = [];
      */

      // Most of this code has been commented out because it caused battery drain,
      // even at a multi-second interval.
      //
      // We're trying to be more sensitive to those issues now.
      $interval(function() {
        /*
        if(!_deviceId) {
          if(_desiredCar) {
            connect(_desiredCar).catch(function(reason) {
              console.log(reason);
            });
          } else if(_desiredCar) {
            console.log("No device...", _desiredCar);
          }
          return;
        }
        */

        if(!_injected.auth || !_injected.auth.me) {
          return;
        }
        if(_creds.carId && !_lock.token && (!_creds.expire || _creds.expire - new Date() < MINTIME)) {
          // this tries to pull down new tokens --- we try and make sure that we attempt
          // this serially if need be.
          log("Credentials near expiration ... getting new ones");
          _lock.token = true;
          getCredentials(_creds.carId)
            .then(function() { _lock.token = false; })
            .catch(function() { _lock.token = false; });
        }
        /*
          else if(_creds && _creds.authorized) {
          // We try to find out the status of the car ... this is essentially a poll and there's no indication
          // that this is a bad idea since it's a local btle connection
          cis('STATUS_1', function(obj) {
            // This passes up state to the controller if we have it
            if( _injected.ctrl &&
                  // When we come in for the first time we need to report
                  // to the controller what our current status is
                (
                  !_lastStatus ||
                  (_lastStatus.lock !== obj.lock && obj.lock !== UNKNOWN )
                )
              ) {
            }

            _lastStatus = obj;

            // If we are over a certain distance, the door is unlocked, and we haven't recently sent
            // an unlock command, then we try to lock it.
            if( average < -90.2 &&
                !isLocked() &&
                ( _lastCommand.CENTRAL_LOCK_OPEN && (new Date() - _lastCommand.CENTRAL_LOCK_OPEN) > 20 * 1000 ) &&
                // Sometimes this gets run multiple times due to a race condition.
                now > (_lock.nextLock + 5000)
              ) {
              _lock.nextLock = new Date();
              _res.lock(_creds.carId).catch(failure('lock'));
            }

          }, function() {
            if(!isLocked()) {
              _injected.lock({id: _creds.carId});
            }
            disconnect();
          });
        }

        ble.readRSSI(_deviceId, function(rssi) {
          // Our signal strength has a lot of variance so
          // we average it out in order to make it less jittery.
          signalHistory.push(rssi);
          if(signalHistory.length > 10) {
            signalHistory.shift();
            // we only report the average when we have enough samples.
            average = signalHistory.reduceRight(function(a, b) { return a + b }, 0) / signalHistory.length;
          }
        });
        */

      }, 90 * 1000);
    }

    _res = {
      disconnect: disconnectAndForget,
      immobilize: function(carId, what) { return wrap(carId, what ? 'IMMOBILIZER_LOCK' : 'IMMOBILIZER_UNLOCK'); },
      connect:    connect,
      lock:   function (carId, done) { return wrap(carId, 'CENTRAL_LOCK_CLOSE', done); },
      unlock: function (carId, done) { return wrap(carId, 'CENTRAL_LOCK_OPEN', done); },
      any: function(carId, what) { return wrap(carId, what); },
      status: getStatus,
      setFunction: setFunction
    };

    $window.blefn.n = _res;
    $window.blefn.i = _injected;

    poll();

    return _res;
  }
]);
