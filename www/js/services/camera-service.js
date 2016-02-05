'use strict';
var angular = require('angular');
require('ngCordova');
require('./auth-service.js');

module.exports = angular.module('app.services').factory('CameraService', [
  '$window',
  '$cordovaCamera',
  '$q',
  function ($window, $cordovaCamera, $q) {

    function getPicture(width, height, fromLibrary) {
      if (!$window.Camera) {
        return $q.reject('This feature works only on mobile');
      }

      var sourceType = $window.Camera.PictureSourceType.CAMERA;
      if (fromLibrary) {
        sourceType = $window.Camera.PictureSourceType.PHOTOLIBRARY;
      }

      var options = {
        quality: 75,
        destinationType: $window.Camera.DestinationType.FILE_URI,
        sourceType: sourceType,
        encodingType: $window.Camera.EncodingType.JPEG,
        targetWidth: width || 800,
        targetHeight: height || 800,
        saveToPhotoAlbum: true,
        correctOrientation: true,
        cameraDirection: $window.Camera.Direction.BACK
      };

      return $cordovaCamera.getPicture(options);
    }

    function pickFile (width, height) {
      return getPicture(width, height, true);
    }

    return {
      getPicture: getPicture,
      pickFile: pickFile
    };

  }
]);
