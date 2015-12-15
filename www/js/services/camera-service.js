'use strict';
var angular = require('angular');
require('ngCordova');
require('./auth-service.js');

module.exports = angular.module('app.services').factory('CameraService', [
  '$cordovaCamera',
  '$cordovaFileTransfer',
  '$q',
  '$settings',
  '$window',
  '$auth',
  function ($cordovaCamera, $cordovaFileTransfer, $q, $settings, $window, $auth) {

    var endpoint = $settings.uri.api + '/files';

    function getPicture(width, height, upload) {
      if (!$window.Camera) {
        return $q.reject('This feature works only on mobile');
      }

      var sourceType = $window.Camera.PictureSourceType.CAMERA;
      if (upload) {
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

    function pickFile(width, height) {
      return getPicture(width, height, true);
    }

    function uploadPicture (filePath) {
      var options = {
        headers: {
          Connection: 'close',
          Authorization: $auth.token.token
        },
        fileKey: 'files',
        fileName: $auth.token.token.substr(0, 10) + '_license.jpg',
        mimeType: 'image/jpeg',
      };

      return $cordovaFileTransfer.upload(endpoint, filePath, options, true)
        .then(function (response) {
          if (response && response.responseCode === 200){
            response = angular.fromJson(response.response);
          }
          return response;
        })
        .finally(function () {
          $cordovaCamera.cleanup();
        });
    }

    return {
      getPicture: getPicture,
      uploadPicture: uploadPicture,
      pickFile: pickFile
    };

  }
]);
