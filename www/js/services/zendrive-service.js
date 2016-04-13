/*global Zendrive: true*/
/*eslint strict: 0 */

var angular = require('angular');
require('ngCordova');
module.exports = angular.module('app.services').factory('ZendriveService', [
  '$settings',
  // '$cordovaZendrive',
  function($settings, $cordovaZendrive) {
    // var Zendrive = $cordovaZendrive;
    function startDrive() {}
    function endDrive() {}
    function locationDenied() {}

    function start(user, bookingId, carId) {
      try {
        var config = new Zendrive.ZendriveConfiguration($settings.zendrive.key, '' + user.id);

        var driverAttributes = new Zendrive.ZendriveDriverAttributes();
        driverAttributes.firstName = user.firstName;
        driverAttributes.lastName = user.lastName;
        driverAttributes.email = user.email;
        driverAttributes.phoneNumber = user.phone.replace('+', '');
        config.driverAttributes = driverAttributes;

        config.driveDetectionMode = Zendrive.ZendriveDriveDetectionMode.ZendriveDriveDetectionModeAutoON;

        var zendriveCallback = new Zendrive.ZendriveCallback(startDrive, endDrive, locationDenied);

        Zendrive.setup(config, zendriveCallback,
          function() {
            console.log('Zendrive setup done');
          },
          function(err) {
            console.log('Zendrive setup failed: ', err);
          }
        );
      } catch(err) {
        console.log('Failed to start zendrive: ', err, err.stack);
      }
    }

    function stop() {
      try {
        Zendrive.teardown();
        console.log('Zendrive teardown complete');
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
