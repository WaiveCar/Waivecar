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
      NOP: false,
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
    var _rssi = {};
    var _creds = {};
    var _scanCache = {};
    var _lastStatus = false;
    var _signalHistory = [];
    var _lastCommand = {};
    var LOCKED = 1;
    var UNLOCKED = 2;
    var ON = 2;
    var OFF = 1;
    
    // If the token is set to expire then we need to grab another. We assume
    //
    //  clock drift + network time + estimated 90% network failure time (signal) + unknown unknowns
    //
    // 60s + 15s + 90s + 45s = 2.5 minutes ... 
    //
    //  that means that if a token is expiring in 2.5 minutes we try to go
    //  out and get another one
    //
    var MINTIME = 210 * 1000;
    var mlog = {};

    $window.blefn = {
      finder: function() {
        getBle().then(function() {
          $window.setInterval(function() {
            var col = [];
            ble.startScan([], function(car) { 
              if(mlog[car.id]) {
                //if(car.rssi > -80 && car.rssi - mlog[car.id].rssi !== 0) {
                  col.push([car.name, car.rssi, car.rssi - mlog[car.id].rssi].join(' '));
                  console.log(col.length);
                //}
              }
              mlog[car.id] = car;
            });
            col = col.sort(function(a, b) {
              return a[0] - b[0];
            });
            if(col.length > 0) {
              console.log(col);
            }

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
      console.log(log.time() + what);
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

    // a wrapper around the ble functions so we know that things are enabled or not.
    function getBle() {
      var defer = $q.defer();
      var fn;

      if(ionic.Platform.isIOS()) {
        fn = ble.isEnabled;
      } else {
        fn = ble.enable;
      }

      fn(ok("BLE on", defer.resolve), failure('ble not enabled', defer.reject));

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
            value = new Uint8Array(buf, pointer, 1);
            pointer += 1;
            break;
          case 2:
            value = new Uint16Array(buf.slice(pointer, pointer + 2), 0, 1);
            pointer += 2;
            break;
          case 4:
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
        log("connected to " + _deviceId);
        success();
      }, failure('ble.connect', fail));
    }

    // There's a "cache" to speed things up. If
    // we try to reconnect, then we look for the
    // mapping between the car and the mac address
    // If we can find it then we just try to connect.
    function findCarById(id, success, fail) {
      var _car = _scanCache[id];
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
            lowLevelConnect(car, success, fail);
          }
        }, failure('scan', fail));
      });
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

    function doit(what, success, fail) {
      var command = new Array(10).fill(0);
      command[0] = _ccsMap[what];
      cis('COMMAND_CHALLENGE', function(commandChallenge) {
        // This is a NOP command to initially connect to
        // the btle
        if(command[0] === false) {
          return success();
        }

        commandChallenge = new Uint8Array(commandChallenge);
        var valueCommandArray = command.concat(_.toArray(commandChallenge));

        // The order of these arguments is inconsistent with invers's documentation.  
        // This is correct, the documentation is wrong.
        var responseb64 = hmacsha1(bin2str(_sessionKey), bin2str(valueCommandArray));
        var payload = command.concat(b642array(responseb64)).slice(0, 20);
        var toWrite = (new Uint8Array(payload)).buffer;
        //console.log(buf2hex(toWrite), payload);
        ble.write(_deviceId, CAR_CONTROL_SERVICE, COMMAND_PHONE, toWrite, success, failure(what, fail));
      }, failure(what, fail));
    }

    function connect(carId) {
      var defer = $q.defer();

      // we can get here before we have creds at all, in which case we claim that
      // we are expired.
      var expired = _creds.expire ? _creds.expire - new Date() < MINTIME : true;

      // If we are trying to connect to the same car, we haven't disconnected, and the
      // credentials haven't expired, then we can just completely skip this step.
      if(_creds.carId === carId && !_creds.disconnected && !expired) {
        defer.resolve();
      } else {
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
        function authorize(creds) {
          var token = b642bin(creds.token);
          _creds = creds;
          _creds.carId = carId;
          _creds.disconnected = false;
          _creds.expire = new Date(creds.valid_until);
          _sessionKey = b642bin(creds.sessionKey);

          log("Looking for Car " + carId);
          findCarById(carId, function() {
            log("Authorizing Vehicle");
            writeBig(CAR_CONTROL_SERVICE, AUTHORIZE_PHONE, token, defer.resolve, failure('write', defer.reject));
          }, failure('find car', defer.reject));
        }
        if(!expired) {
          log("Using existing token");
          authorize(_creds);
        } else {
          log("Getting tokens");
          _injected.getBle({ id: carId }).$promise.then(authorize);
        }
      }
      return defer.promise;
    }

    function disconnect() {
      log("Disconnecting from " + _deviceId);
      _creds.disconnected = true;
      _deviceId = false;
    }

    function wrap(carId, cmd) {
      log.reset();
      var defer = $q.defer();

      connect(carId).then(function(){ 
        log("Doing " + cmd);
        _lastCommand[cmd] = new Date();
        return doit(cmd, defer.resolve, defer.reject);
      }).catch(failure("connect", defer.reject));

      return defer.promise;
    }

    function isLocked() {
      if(_lastStatus) { 
        return _lastStatus.lock[0] === LOCKED;
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

    var res = {
      disconnect: disconnect,
      immobilize: function(carId, what) { return wrap(carId, what ? 'IMMOBILIZER_LOCK' : 'IMMOBILIZER_UNLOCK'); },
      nop:    function (carId) { return wrap(carId, 'NOP'); },
      lock:   function (carId) { return wrap(carId, 'CENTRAL_LOCK_CLOSE'); },
      unlock: function (carId) { return wrap(carId, 'CENTRAL_LOCK_OPEN'); },
      status: getStatus,
      setFunction: setFunction
    };

    $window.blefn.n = res;
    $window.blefn.i = _injected;

    $interval(function() {
      if(!_deviceId) {
        return;
      }
      ble.readRSSI(_deviceId, function(rssi) {

        // Our signal strength has a lot of variance so
        // we average it out in order to make it less jittery.
        _signalHistory.push(rssi);
        var average = 0;
        if(_signalHistory.length > 10) {
          _signalHistory.shift();
          // we only report the average when we have enough samples.
          average = _signalHistory.reduceRight(function(a, b) { return a + b }, 0) / _signalHistory.length;
        }

        cis('STATUS_1', function(obj) {
          _lastStatus = obj;
          console.log(_lastStatus.lock[0], rssi, average, (new Date() - _lastCommand.CENTRAL_LOCK_OPEN) );

          // If we are over a certain distance, the door is unlocked, and we haven't recently sent
          // an unlock command, then we try to lock it.
          if( average < -90.2 && 
              !isLocked() && 
              ( _lastCommand.CENTRAL_LOCK_OPEN && (new Date() - _lastCommand.CENTRAL_LOCK_OPEN) > 20 * 1000 )
            ) {
            res.lock(_creds.carId);
          }

        }, function() {
          if(_lastStatus) {

            if(_lastStatus.lock[0] === UNLOCKED) {
              log("Last status is unlocked, locking");
              _injected.lock({id: _creds.carId});
            }
          }
          disconnect();
        });
      });
    }, 300);


    return res;
  }

]);
