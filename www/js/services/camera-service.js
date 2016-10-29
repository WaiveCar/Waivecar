'use strict';
var angular = require('angular');
require('ngCordova');
require('./auth-service.js');

module.exports = angular.module('app.services').factory('CameraService', [
  '$window',
  '$cordovaCamera',
  'PermissionService',
  '$q',
  function ($window, $cordovaCamera, PermissionService, $q) {

    function getPermissions(fromLibrary) {
      if (!fromLibrary) {
        PermissionService.getPermissionsIfNeeded('CAMERA');
      }
    }

    function getPicture(width, height, fromLibrary) {
      if (!$window.Camera) {
        return $q.reject('This feature works only on mobile');
      }

      var options = {
        quality: 75,
        destinationType: $window.Camera.DestinationType.FILE_URI,
        encodingType: $window.Camera.EncodingType.JPEG,
        targetWidth: width || 800,
        targetHeight: height || 800,
        saveToPhotoAlbum: true,
        correctOrientation: true,
        cameraDirection: $window.Camera.Direction.BACK
      };

      if (fromLibrary) {
        options.sourceType = $window.Camera.PictureSourceType.PHOTOLIBRARY;
      } else {
        options.sourceType = $window.Camera.PictureSourceType.CAMERA;
      }

      return $cordovaCamera.getPicture(options);
    }

    function pickFile (width, height) {
      return getPicture(width, height, true);
    }

    return {
      getPermissions: getPermissions,
      getPicture: getPicture,
      pickFile: pickFile
    };

  }
]);
