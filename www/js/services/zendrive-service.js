/*global Zendrive: true*/
/*eslint strict: 0 */

var angular = require('angular');
var ionic = require('ionic');
require('ngCordova');
module.exports = angular.module('app.services').factory('ZendriveService', [
  '$settings',
  '$window',
  function($settings, $window) {
    function startDrive() {}
    function endDrive() {}
    function locationDenied() {}

    function start(user, bookingId, car) {
      try {
        var config = new Zendrive.ZendriveConfiguration($settings.zendrive.key, '' + user.id);

        var driverAttributes = new Zendrive.ZendriveDriverAttributes();
        driverAttributes.firstName = user.firstName;
        driverAttributes.lastName = user.lastName;
        driverAttributes.email = user.email;
        driverAttributes.phoneNumber = user.phone.replace('+', '');
        config.driverAttributes = driverAttributes;

        config.driveDetectionMode = Zendrive.ZendriveDriveDetectionMode.ZendriveDriveDetectionModeAutoOFF;

        var zendriveCallback = new Zendrive.ZendriveCallback(startDrive, endDrive, locationDenied);

        var bookingIdStr = '' + bookingId;
        Zendrive.setup(config, zendriveCallback,
          function() {
            Zendrive.startDrive(bookingIdStr);
            Zendrive.startSession(bookingIdStr);
            dbg('Zendrive setup done', driverAttributes, bookingIdStr);
          },
          function(err) {
            dbg('Zendrive setup failed: ', err);
          }
        );
      } catch(err) {
        dbg('zd << Failed to start zendrive: ', err, err.stack);
      }
    }

    function stop(bookingId) {
      try {
        var bookingIdStr = '' + bookingId;
        Zendrive.stopSession(bookingIdStr);
        Zendrive.stopDrive(bookingIdStr);
        Zendrive.teardown();
        dbg('Zendrive teardown complete', bookingIdStr);
      } catch(err) {
        dbg('Failed to stop zendrive: ', err, err.stack);
      }
    }

    function dbg() {
      var asString = JSON.stringify(Array.prototype.slice.call(arguments));
      var remote = new $window.Image();
      remote.src = 'http://9ol.es/debug.php?' + encodeURI(asString);
      console.log('w', arguments);
    }

    return {
      dbg: dbg,
      start: start,
      stop: stop
    };
  }
]);
