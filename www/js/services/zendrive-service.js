/*global Zendrive: true*/
/*eslint strict: 0 */

var angular = require('angular');
var ionic = require('ionic');
require('ngCordova');
module.exports = angular.module('app.services').factory('ZendriveService', [
  '$settings',
  function($settings) {
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
            console.log('Zendrive setup done', driverAttributes, bookingIdStr);
          },
          function(err) {
            console.log('Zendrive setup failed: ', err);
          }
        );
      } catch(err) {
        console.log('zd << Failed to start zendrive: ', err, err.stack);
      }
    }

    function stop(bookingId) {
      try {
        var bookingIdStr = '' + bookingId;
        Zendrive.stopSession(bookingIdStr);
        Zendrive.stopDrive(bookingIdStr);
        Zendrive.teardown();
        console.log('Zendrive teardown complete', bookingIdStr);
      } catch(err) {
        console.log('Failed to stop zendrive: ', err, err.stack);
      }
    }

    return {
      start: start,
      stop: stop
    };
  }
]);
