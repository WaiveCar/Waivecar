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

    _ccsMap.start = _ccsMap.CENTRAL_LOCK_OPEN | _ccsMap.IMMOBILIZER_UNLOCK;
    _ccsMap.finish = _ccsMap.CENTRAL_LOCK_CLOSE | _ccsMap.IMMOBILIZER_LOCK;

    var _sessionKey = false;
    var _deviceId = false;
    var _injected = {};
    var _rssi = {};
    var _creds = {};

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

    $window.blefn = {
      scan: function() {
        getBle().then(function() {
          ble.startScan([], function(car) { 
            console.log(car);
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

      (ionic.Platform.isIOS() ? ble.isEnabled : ble.enable )(defer.resolve, failure('ble not enabled', defer.reject));
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

    function cis(what, success, fail) {
      getBle().then(function() {
        ble.read(_deviceId, CAR_INFORMATION_SERVICE, _cisMap[what], success, fail);
      }).catch(fail);
    }

    function findCarById(id, success, fail) {
      getBle().then(function() {
        ble.startScan([], function(car) { 
          if (car.name !== id) {
            return;
          }
          log('Found car ' + car.id);
          _deviceId = car.id;
          ble.connect(car.id, function() {
            log('Connected');
            success();
          }, failure('ble.connect', fail));
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
        commandChallenge = new Uint8Array(commandChallenge);
        var valueCommandArray = command.concat(_.toArray(commandChallenge));
        var responseb64 = hmacsha1(bin2str(_sessionKey), bin2str(valueCommandArray));
        var payload = command.concat(b642array(responseb64)).slice(0, 20);
        var toWrite = (new Uint8Array(payload)).buffer;
        ble.write(_deviceId, CAR_CONTROL_SERVICE, COMMAND_PHONE, toWrite, success, failure(what, fail));
      }, failure(what, fail));
    }

    function connect(carId) {
      var defer = $q.defer();
      if(_creds.carId === carId && _creds.expire - new Date() > MINTIME) {
        defer.resolve();
      } else {
        log("Getting tokens");
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
        _injected.getBle({ id: carId }).$promise.then(function(creds) {
          var token = b642bin(creds.token);
          _creds = creds;
          _creds.carId = carId;
          _creds.expire = new Date(creds.valid_until);
          _sessionKey = b642bin(creds.sessionKey);

          log("Looking for Car");
          findCarById(carId, function() {
            log("Authorizing Vehicle");
            writeBig(CAR_CONTROL_SERVICE, AUTHORIZE_PHONE, token, defer.resolve, failure('write', defer.reject));
          }, failure('find car', defer.reject));
        });
      }
      return defer.promise;
    }

    function wrap(carId, cmd) {
      log.reset();
      var defer = $q.defer();

      connect(carId).then(function(){ 
        log("Doing " + cmd);
        return doit(cmd, defer.resolve, defer.reject);
      }).catch(failure("connect", defer.reject));

      return defer.promise;
    }

    return {
      lock:   function (carId) { return wrap(carId, _ccsMap.CENTRAL_LOCK_CLOSE); },
      unlock: function (carId) { return wrap(carId, _ccsMap.CENTRAL_LOCK_OPEN); },
      setFunction: setFunction
    };

    $interval(function() {
      log("Here");
      if(!_deviceId) {
        return;
      }
      ble.readRSSI(_deviceId, function(rssi) {
        _rssi = {
          quality: rssi,
          time: new Date()
        };
        console.log(_rssi);
      });
    }, 2000);


    /*
    $window.bleread = function(what) {
      cis(what, function(a) {
        $window.bleres[what] = a;
        console.log('read ' + what);
      }, failure('read ' + what));
    };
    */
  }

]);
